/* eslint-disable no-console */

import { ZERO } from '@orca-so/sdk';
import type { Network } from '@saberhq/solana-contrib';
import { AccountLayout, Token, u64 } from '@solana/spl-token';
import type { TransactionInstruction } from '@solana/web3.js';
import { Account, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import promiseRetry from 'promise-retry';

import type { FeeRelayerConfiguration, StatsInfoDeviceType } from 'new/sdk/FeeRelayer';
import {
  DestinationAnalysator,
  StatsInfoOperationType,
  TransitTokenAccountAnalysator,
} from 'new/sdk/FeeRelayer';
import type { FeeRelayerAPIClientType } from 'new/sdk/FeeRelayer/apiClient/FeeRelayerAPIClient';
import { FeeRelayerError } from 'new/sdk/FeeRelayer/models/FeeRelayerError';
import { FeeRelayerRequestType } from 'new/sdk/FeeRelayer/models/FeeRelayerRequestType';
import { getSwapData } from 'new/sdk/FeeRelayer/relay/helpers/FeeRelayerRelayExtensions';
import { FeeRelayerRelayProgram } from 'new/sdk/FeeRelayer/relay/RelayProgram/FeeRelayerRelayProgram';
import type * as OrcaSwap from 'new/sdk/OrcaSwap';
import { getInputAmountSlippage, OrcaSwapError } from 'new/sdk/OrcaSwap';
import type { TransactionID } from 'new/sdk/SolanaSDK';
// import type { SolanaSDKAccountStorage } from 'new/sdk/SolanaSDK';
import * as SolanaSDK from 'new/sdk/SolanaSDK';
import {
  getAssociatedTokenAddressSync,
  LogEvent,
  Logger,
  SolanaSDKPublicKey,
} from 'new/sdk/SolanaSDK';

import type { TokenAccount } from '../models';
import type { FeeRelayerRelaySwapType } from './helpers';
import {
  Cache,
  DirectSwapData,
  FreeTransactionFeeLimit,
  RelayAccountStatus,
  RelayAccountStatusType,
  RelayTransactionParam,
  SwapData,
  SwapTransactionSignatures,
  TopUpPreparedParams,
  TopUpWithSwapParams,
  TransitiveSwapData,
} from './helpers';
import type { FeeRelayerRelaySolanaClient } from './helpers/FeeRelayerRelaySolanaClient';
import { FeesAndPools, getSignature, TopUpAndActionPreparedParams } from './index';

/// Top up and make a transaction
/// STEP 0: Prepare all information needed for the transaction
/// STEP 1: Calculate fee needed for transaction
/// STEP 1.1: Check free fee supported or not
/// STEP 2: Check if relay account has already had enough balance to cover transaction fee
/// STEP 2.1: If relay account has not been created or has not have enough balance, do top up
/// STEP 2.1.1: Top up with needed amount
/// STEP 2.1.2: Make transaction
/// STEP 2.2: Else, skip top up
/// STEP 2.2.1: Make transaction
/// - Returns: Array of strings contain transactions' signatures

export interface FeeRelayerRelayType {
  /// Expose current variable
  cache: Cache;

  /// Load all needed info for relay operations, need to be completed before any operation
  load(): Promise<void>;

  /// Check if user has free transaction fee
  getFreeTransactionFeeLimit(): Promise<FreeTransactionFeeLimit>;

  /// Get info of relay account
  getRelayAccountStatus(): Promise<RelayAccountStatus>;

  /// Calculate needed top up amount for expected fee
  calculateNeededTopUpAmount({
    expectedFee,
    payingTokenMint,
  }: {
    expectedFee: SolanaSDK.FeeAmount;
    payingTokenMint?: PublicKey;
  }): Promise<SolanaSDK.FeeAmount>;

  /// Calculate fee needed in paying token
  calculateFeeInPayingToken({
    feeInSOL,
    payingFeeTokenMint,
  }: {
    feeInSOL: SolanaSDK.FeeAmount;
    payingFeeTokenMint: string;
  }): Promise<SolanaSDK.FeeAmount>;

  /// Top up relay account (if needed) and relay transaction
  topUpAndRelayTransaction({
    transaction,
    fee,
    config,
  }: {
    transaction: SolanaSDK.PreparedTransaction;
    fee?: TokenAccount | null;
    config: FeeRelayerConfiguration;
  }): Promise<TransactionID>;

  /// Top up relay account (if needed) and relay mutiple transactions
  topUpAndRelayTransactions({
    transactions,
    fee,
    config,
  }: {
    transactions: SolanaSDK.PreparedTransaction[];
    fee?: TokenAccount;
    config: FeeRelayerConfiguration;
  }): Promise<TransactionID[]>;

  /// SPECIAL METHODS FOR SWAP NATIVELY
  /// Calculate needed top up amount, specially for swapping
  calculateNeededTopUpAmountNative({
    swapTransactions,
    payingTokenMint,
  }: {
    swapTransactions: OrcaSwap.PreparedSwapTransaction[];
    payingTokenMint?: PublicKey;
  }): Promise<SolanaSDK.FeeAmount>;

  /// Top up relay account and swap natively
  topUpAndSwap({
    swapTransactions,
    feePayer,
    payingFeeToken,
  }: {
    swapTransactions: OrcaSwap.PreparedSwapTransaction[];
    feePayer: PublicKey;
    payingFeeToken?: TokenAccount;
  }): Promise<string[]>;

  /// SPECIAL METHODS FOR SWAP WITH RELAY PROGRAM
  /// Calculate network fees for swapping
  calculateSwappingNetworkFees({
    swapPools,
    sourceTokenMint,
    destinationTokenMint,
    destinationAddress,
  }: {
    swapPools?: OrcaSwap.PoolsPair;
    sourceTokenMint: PublicKey;
    destinationTokenMint: PublicKey;
    destinationAddress?: PublicKey;
  }): Promise<SolanaSDK.FeeAmount>;

  /// Prepare swap transaction for relay using RelayProgram
  prepareSwapTransaction({
    sourceToken,
    destinationTokenMint,
    destinationAddress,
    payingFeeToken,
    swapPools,
    inputAmount,
    slippage,
  }: {
    sourceToken: TokenAccount;
    destinationTokenMint: PublicKey;
    destinationAddress?: PublicKey;
    payingFeeToken: TokenAccount;
    swapPools: OrcaSwap.PoolsPair;
    inputAmount: u64;
    slippage: number;
  }): Promise<{
    transactions: SolanaSDK.PreparedTransaction[];
    additionalPaybackFee: u64;
  }>;
}

export class FeeRelayerRelay implements FeeRelayerRelayType {
  // Dependencies
  feeRelayerAPIClient: FeeRelayerAPIClientType;
  solanaClient: FeeRelayerRelaySolanaClient;
  // accountStorage: SolanaSDKAccountStorage;
  orcaSwapClient: OrcaSwap.OrcaSwapType;

  // Properties
  cache: Cache;
  owner: PublicKey;
  deviceType: StatsInfoDeviceType;
  buildNumber: string | null;

  constructor({
    owner,
    feeRelayerAPIClient,
    solanaClient,
    orcaSwapClient,
    deviceType,
    buildNumber,
  }: {
    owner: PublicKey;
    feeRelayerAPIClient: FeeRelayerAPIClientType;
    solanaClient: FeeRelayerRelaySolanaClient;
    // accountStorage: SolanaSDKAccountStorage,
    orcaSwapClient: OrcaSwap.OrcaSwapType;
    deviceType: StatsInfoDeviceType;
    buildNumber: string | null;
  }) {
    // const owner = accountStorage.account;
    // if (!owner) {
    //   throw FeeRelayerError.unauthorized();
    // }

    this.feeRelayerAPIClient = feeRelayerAPIClient;
    this.solanaClient = solanaClient;
    // this.accountStorage = accountStorage;
    this.orcaSwapClient = orcaSwapClient;
    this.owner = owner;
    this.cache = new Cache();
    this.deviceType = deviceType;
    this.buildNumber = buildNumber;
  }

  // Methods

  /// Load all needed info for relay operations, need to be completed before any operation
  load(): Promise<void> {
    return Promise.all([
      // get minimum token account balance
      this.solanaClient.getMinimumBalanceForRentExemption(AccountLayout.span), // 165
      // get minimum relay account balance
      this.solanaClient.getMinimumBalanceForRentExemption(0),
      // get fee payer address
      this.feeRelayerAPIClient.getFeePayerPubkey(),
      // get lamportsPerSignature
      this.solanaClient.getLamportsPerSignature(),
      // get relayAccount status
      this.updateRelayAccountStatus(),
      // get free transaction fee limit
      this.updateFreeTransactionFeeLimit(),
    ]).then(
      ([
        minimumTokenAccountBalance,
        minimumRelayAccountBalance,
        feePayerAddress,
        lamportsPerSignature,
      ]) => {
        this.cache.minimumTokenAccountBalance = minimumTokenAccountBalance;
        this.cache.minimumRelayAccountBalance = minimumRelayAccountBalance;
        this.cache.feePayerAddress = feePayerAddress;
        this.cache.lamportsPerSignature = lamportsPerSignature;
      },
    );
  }

  /// Check if user has free transaction fee
  getFreeTransactionFeeLimit(): Promise<FreeTransactionFeeLimit> {
    return this.updateFreeTransactionFeeLimit().then(() => {
      const cached = this.cache.freeTransactionFeeLimit;
      if (!cached) {
        throw FeeRelayerError.unknown();
      }
      return cached;
    });
  }

  /// Get info of relay account
  getRelayAccountStatus(): Promise<RelayAccountStatus> {
    return this.updateRelayAccountStatus().then(() => {
      const cached = this.cache.relayAccountStatus;
      if (!cached) {
        throw FeeRelayerError.unknown();
      }
      return cached;
    });
  }

  private _calculateNeededTopUpAmount({
    expectedFee,
    payingTokenMint,
    freeTransactionFeeLimit,
    relayAccountStatus,
  }: {
    expectedFee: SolanaSDK.FeeAmount;
    payingTokenMint?: PublicKey;
    freeTransactionFeeLimit: FreeTransactionFeeLimit;
    relayAccountStatus: RelayAccountStatus;
  }): SolanaSDK.FeeAmount {
    const amount = this._calculateMinTopUpAmount({
      expectedFee,
      payingTokenMint,
      freeTransactionFeeLimit,
      relayAccountStatus,
    });
    // Correct amount if it's too small
    if (amount.total.gtn(0) && amount.total.ltn(1000)) {
      amount.transaction = new u64(amount.transaction.add(new u64(1000).sub(amount.total)));
    }
    return amount;
  }

  /// Calculate needed top up amount for expected fee
  private _calculateMinTopUpAmount({
    expectedFee,
    payingTokenMint,
    freeTransactionFeeLimit,
    relayAccountStatus,
  }: {
    expectedFee: SolanaSDK.FeeAmount;
    payingTokenMint?: PublicKey;
    freeTransactionFeeLimit: FreeTransactionFeeLimit;
    relayAccountStatus: RelayAccountStatus;
  }): SolanaSDK.FeeAmount {
    const neededAmount = expectedFee.clone();

    // expected fees
    const expectedTopUpNetworkFee = new u64(
      (this.cache.lamportsPerSignature ?? new u64(5000)).muln(2),
    );
    const expectedTransactionNetworkFee = expectedFee.transaction;

    // real fees
    let neededTopUpNetworkFee = expectedTopUpNetworkFee;
    let neededTransactionNetworkFee = expectedTransactionNetworkFee;

    // is Top up free
    if (
      freeTransactionFeeLimit.isFreeTransactionFeeAvailable({
        transactionFee: expectedTopUpNetworkFee,
      })
    ) {
      neededTopUpNetworkFee = ZERO;
    }

    // is transaction free
    if (
      freeTransactionFeeLimit.isFreeTransactionFeeAvailable({
        transactionFee: expectedTopUpNetworkFee.add(expectedTransactionNetworkFee),
        forNextTransaction: true,
      })
    ) {
      neededTransactionNetworkFee = ZERO;
    }

    neededAmount.transaction = new u64(neededTopUpNetworkFee.add(neededTransactionNetworkFee));

    // transaction is totally free
    if (neededAmount.total.eqn(0)) {
      return neededAmount;
    }

    const neededAmountWithoutCheckingRelayAccount = neededAmount;
    const minimumRelayAccountBalance = this.cache.minimumRelayAccountBalance ?? new u64(890880);

    // check if relay account current balance can cover part of needed amount
    let relayAccountBalance = relayAccountStatus.balance;
    if (relayAccountBalance) {
      if (relayAccountBalance.lt(minimumRelayAccountBalance)) {
        neededAmount.transaction = new u64(
          neededAmount.transaction.add(minimumRelayAccountBalance.sub(relayAccountBalance)),
        );
      } else {
        relayAccountBalance = new u64(relayAccountBalance.sub(minimumRelayAccountBalance));

        // if relayAccountBalance has enough balance to cover transaction fee
        if (relayAccountBalance.gte(neededAmount.transaction)) {
          neededAmount.transaction = ZERO;

          // if relayAccountBalance has enough balance to cover accountBalances fee too
          if (relayAccountBalance.sub(neededAmount.transaction).gte(neededAmount.accountBalances)) {
            neededAmount.accountBalances = ZERO;
          }
          // Relay account balance can cover part of account creation fee
          else {
            neededAmount.accountBalances = new u64(
              neededAmount.accountBalances
                .sub(relayAccountBalance.sub(neededAmount.transaction))
                .toString(),
            );
          }
        }
        // if not, relayAccountBalance can cover part of transaction fee
        else {
          neededAmount.transaction = new u64(neededAmount.transaction.sub(relayAccountBalance));
        }
      }
    } else {
      neededAmount.transaction = new u64(neededAmount.transaction.add(minimumRelayAccountBalance));
    }

    // if relay account could not cover all fees and paying token is WSOL, the compensation will be done without the existense of relay account
    if (neededAmount.total.gtn(0) && payingTokenMint?.equals(SolanaSDKPublicKey.wrappedSOLMint)) {
      return neededAmountWithoutCheckingRelayAccount;
    }

    return neededAmount;
  }

  async calculateNeededTopUpAmount({
    expectedFee,
    payingTokenMint,
  }: {
    expectedFee: SolanaSDK.FeeAmount;
    payingTokenMint?: PublicKey;
  }): Promise<SolanaSDK.FeeAmount> {
    let freeTransactionFeeLimitRequest: Promise<FreeTransactionFeeLimit>;
    const _freeTransactionFeeLimit = this.cache.freeTransactionFeeLimit;
    if (_freeTransactionFeeLimit) {
      freeTransactionFeeLimitRequest = Promise.resolve(_freeTransactionFeeLimit);
    } else {
      freeTransactionFeeLimitRequest = this.getFreeTransactionFeeLimit();
    }

    try {
      const [freeTransactionFeeLimit, relayAccountStatus] = await Promise.all([
        freeTransactionFeeLimitRequest,
        this.getRelayAccountStatus(),
      ]);
      return this._calculateNeededTopUpAmount({
        expectedFee,
        payingTokenMint,
        freeTransactionFeeLimit,
        relayAccountStatus,
      });
    } catch (error) {
      console.error(error);
      return expectedFee;
    }
  }

  /// Calculate needed fee (count in payingToken)
  async calculateFeeInPayingToken({
    feeInSOL,
    payingFeeTokenMint,
  }: {
    feeInSOL: SolanaSDK.FeeAmount;
    payingFeeTokenMint: string;
  }): Promise<SolanaSDK.FeeAmount> {
    if (payingFeeTokenMint === SolanaSDKPublicKey.wrappedSOLMint.toString()) {
      return feeInSOL;
    }
    const tradableTopUpPoolsPair = await this.orcaSwapClient.getTradablePoolsPairs({
      fromMint: payingFeeTokenMint,
      toMint: SolanaSDKPublicKey.wrappedSOLMint.toString(),
    });
    const topUpPools = this.orcaSwapClient.findBestPoolsPairForEstimatedAmount({
      estimatedAmount: feeInSOL.total,
      poolsPairs: tradableTopUpPoolsPair,
    });
    if (!topUpPools) {
      throw FeeRelayerError.swapPoolsNotFound();
    }

    const transactionFee = getInputAmountSlippage(topUpPools, feeInSOL.transaction, 0.03);
    const accountCreationFee = getInputAmountSlippage(topUpPools, feeInSOL.accountBalances, 0.03);

    return new SolanaSDK.FeeAmount({
      transaction: transactionFee ?? ZERO,
      accountBalances: accountCreationFee ?? ZERO,
    });
  }

  /// Generic function for sending transaction to fee relayer's relay
  async topUpAndRelayTransaction({
    transaction,
    fee,
    config,
  }: {
    transaction: SolanaSDK.PreparedTransaction;
    fee?: TokenAccount | null;
    config: FeeRelayerConfiguration;
  }): Promise<TransactionID> {
    const result = (
      await this.topUpAndRelayTransactions({
        transactions: [transaction],
        fee,
        config,
      })
    )[0];
    if (!result) {
      throw FeeRelayerError.unknown();
    }
    return result;
  }

  async topUpAndRelayTransactions({
    transactions,
    fee,
    config,
  }: {
    transactions: SolanaSDK.PreparedTransaction[];
    fee?: TokenAccount | null;
    config: FeeRelayerConfiguration;
  }): Promise<TransactionID[]> {
    const expectedFees = transactions.map((tx) => tx.expectedFee);
    const res = await this.checkAndTopUp({
      expectedFee: new SolanaSDK.FeeAmount({
        transaction: expectedFees
          .map((fee) => fee.transaction)
          .reduce((acc, val) => acc.add(val), ZERO),
        accountBalances: expectedFees
          .map((fee) => fee.accountBalances)
          .reduce((acc, val) => acc.add(val), ZERO),
      }),
      payingFeeToken: fee,
    });

    try {
      const trx: TransactionID[] = [];
      for (const preparedTransaction of transactions) {
        const request = await this.relayTransaction({
          preparedTransaction,
          payingFeeToken: fee,
          relayAccountStatus: this.cache.relayAccountStatus ?? RelayAccountStatus.notYetCreated(),
          additionalPaybackFee: transactions.length > 0 ? config.additionalPaybackFee : ZERO,
          operationType: config.operationType,
          currency: config.currency,
        });

        trx.push(...request);
      }

      return trx;
    } catch (error) {
      if (res) {
        throw FeeRelayerError.topUpSuccessButTransactionThrows();
      }
      throw error;
    }
  }

  // FeeRelayerRelayExtensions

  // Top up
  /// Prepare swap data from swap pools
  prepareSwapData({
    pools,
    inputAmount,
    minAmountOut,
    slippage,
    transitTokenMintPubkey = null,
    newTransferAuthority = false,
    needsCreateTransitTokenAccount,
  }: {
    pools: OrcaSwap.PoolsPair;
    inputAmount?: u64 | null;
    minAmountOut?: u64 | null;
    slippage: number;
    transitTokenMintPubkey?: PublicKey | null;
    newTransferAuthority?: boolean;
    needsCreateTransitTokenAccount: boolean;
  }): {
    swapData: FeeRelayerRelaySwapType;
    transferAuthorityAccount: Account | null;
  } {
    // preconditions
    if (pools.length === 0 || pools.length > 2) {
      throw FeeRelayerError.swapPoolsNotFound();
    }

    if (!inputAmount && !minAmountOut) {
      throw FeeRelayerError.invalidAmount();
    }

    // create transferAuthority
    const transferAuthority = new Account();

    // form topUp params
    if (pools.length === 1) {
      const pool = pools[0]!;

      const amountIn = inputAmount ?? pool.getInputAmountSlippage(minAmountOut!, slippage);
      const minAmountOutNew = minAmountOut ?? pool.getInputAmountSlippage(inputAmount!, slippage);
      if (!amountIn || !minAmountOutNew) {
        throw FeeRelayerError.invalidAmount();
      }

      const directSwapData = getSwapData({
        pool,
        transferAuthorityPubkey: newTransferAuthority ? transferAuthority.publicKey : this.owner,
        amountIn,
        minAmountOut: minAmountOutNew,
      });
      return {
        swapData: directSwapData,
        transferAuthorityAccount: newTransferAuthority ? transferAuthority : null,
      };
    } else {
      const firstPool = pools[0]!;
      const secondPool = pools[1]!;

      if (!transitTokenMintPubkey) {
        throw FeeRelayerError.transitTokenMintNotFound();
      }

      // if input amount is provided
      let firstPoolAmountIn = inputAmount;
      let secondPoolAmountIn: u64 | null = null;
      let secondPoolAmountOut = minAmountOut;

      if (inputAmount) {
        secondPoolAmountIn = firstPool.getMinimumAmountOut(inputAmount, slippage) ?? ZERO;
        secondPoolAmountOut = secondPool.getMinimumAmountOut(secondPoolAmountIn, slippage);
      } else if (minAmountOut) {
        secondPoolAmountIn = secondPool.getInputAmountSlippage(minAmountOut, slippage) ?? ZERO;
        firstPoolAmountIn = firstPool.getInputAmountSlippage(secondPoolAmountIn, slippage);
      }

      if (!firstPoolAmountIn || !secondPoolAmountIn || !secondPoolAmountOut) {
        throw FeeRelayerError.invalidAmount();
      }

      const transitiveSwapData = new TransitiveSwapData({
        from: getSwapData({
          pool: firstPool,
          transferAuthorityPubkey: newTransferAuthority ? transferAuthority.publicKey : this.owner,
          amountIn: firstPoolAmountIn,
          minAmountOut: secondPoolAmountIn,
        }),
        to: getSwapData({
          pool: secondPool,
          transferAuthorityPubkey: newTransferAuthority ? transferAuthority.publicKey : this.owner,
          amountIn: secondPoolAmountIn,
          minAmountOut: secondPoolAmountOut,
        }),
        transitTokenMintPubkey,
        needsCreateTransitTokenAccount,
      });
      return {
        swapData: transitiveSwapData,
        transferAuthorityAccount: newTransferAuthority ? transferAuthority : null,
      };
    }
  }

  /// Update free transaction fee limit
  updateFreeTransactionFeeLimit(): Promise<void> {
    return this.feeRelayerAPIClient.requestFreeFeeLimits(this.owner.toString()).then((info) => {
      const infoNew = new FreeTransactionFeeLimit({
        maxUsage: info.limits.maxCount,
        currentUsage: info.processedFee.count,
        maxAmount: info.limits.maxAmount,
        amountUsed: info.processedFee.totalAmount,
      });

      this.cache.freeTransactionFeeLimit = infoNew;
    });
  }

  // TODO: context
  updateRelayAccountStatus(): Promise<void> {
    return this.solanaClient
      .getRelayAccountStatus(
        FeeRelayerRelayProgram.getUserRelayAddress({
          user: this.owner,
          network: this.solanaClient.endpoint.network,
        }).toString(),
      )
      .then((info) => {
        this.cache.relayAccountStatus = info;
      });
  }

  markTransactionAsCompleted(freeFeeAmountUsed: u64) {
    if (this.cache.freeTransactionFeeLimit) {
      this.cache.freeTransactionFeeLimit.currentUsage += 1;
      this.cache.freeTransactionFeeLimit.amountUsed = freeFeeAmountUsed;
    }
  }

  // FeeRelayerRelaySwap

  /// Prepare swap transaction for relay
  prepareSwapTransaction({
    sourceToken,
    destinationTokenMint,
    destinationAddress,
    payingFeeToken,
    swapPools,
    inputAmount,
    slippage,
  }: {
    sourceToken: TokenAccount;
    destinationTokenMint: PublicKey;
    destinationAddress?: PublicKey;
    payingFeeToken?: TokenAccount;
    swapPools: OrcaSwap.PoolsPair;
    inputAmount: u64;
    slippage: number;
  }): Promise<{
    transactions: SolanaSDK.PreparedTransaction[];
    additionalPaybackFee: u64;
  }> {
    const transitToken = TransitTokenAccountAnalysator.getTransitToken({
      solanaApiClient: this.solanaClient,
      orcaSwap: this.orcaSwapClient,
      account: this.owner,
      pools: swapPools,
    });
    // get fresh data by ignoring cache
    return Promise.all([
      Promise.all([[this.updateRelayAccountStatus(), this.updateFreeTransactionFeeLimit()]]).then(
        (): Promise<TopUpAndActionPreparedParams> => {
          return this._prepareForTopUpAndSwap({
            sourceToken,
            destinationTokenMint,
            destinationAddress,
            payingFeeToken,
            swapPools,
            reuseCache: false,
          });
        },
      ),
      DestinationAnalysator.analyseDestination({
        apiClient: this.solanaClient,
        destination: destinationAddress,
        mint: destinationTokenMint,
        account: this.owner,
      }),
      this.solanaClient.getRecentBlockhash(),
      TransitTokenAccountAnalysator.checkIfNeedsCreateTransitTokenAccount({
        solanaApiClient: this.solanaClient,
        transitToken,
      }),
    ]).then(([preparedParams, destination, recentBlockhash, needsCreateTransitTokenAccount]) => {
      // get needed info
      const minimumTokenAccountBalance = this.cache.minimumTokenAccountBalance;
      const feePayerAddress = this.cache.feePayerAddress;
      const lamportsPerSignature = this.cache.lamportsPerSignature;
      if (!minimumTokenAccountBalance || !feePayerAddress || !lamportsPerSignature) {
        throw FeeRelayerError.relayInfoMissing();
      }

      const destinationToken = destination.destination;
      // const userDestinationAccountOwnerAddress = destination.userDestinationAccountOwnerAddress;
      const needsCreateDestinationTokenAccount = destination.needCreateDestination;

      const swapFeesAndPools = preparedParams.actionFeesAndPools;
      // const swappingFee = swapFeesAndPools.fee.total;
      const swapPoolsNew = swapFeesAndPools.poolsPair;

      return this._prepareSwapTransaction({
        network: this.solanaClient.endpoint.network,
        sourceToken,
        destinationToken,
        pools: swapPoolsNew,
        inputAmount,
        slippage,
        blockhash: recentBlockhash,
        minimumTokenAccountBalance,
        needsCreateDestinationTokenAccount,
        feePayerAddress,
        needsCreateTransitTokenAccount,
        transitTokenMintPubkey: transitToken ? new PublicKey(transitToken?.mint) : null,
      });
    });
  }

  // FeeRelayerRelaySwap Helpers
  calculateSwappingNetworkFees({
    swapPools,
    sourceTokenMint,
    destinationTokenMint,
    destinationAddress,
  }: {
    swapPools?: OrcaSwap.PoolsPair;
    sourceTokenMint: PublicKey;
    destinationTokenMint: PublicKey;
    destinationAddress?: PublicKey;
  }): Promise<SolanaSDK.FeeAmount> {
    return DestinationAnalysator.analyseDestination({
      apiClient: this.solanaClient,
      destination: destinationAddress,
      mint: destinationTokenMint,
      account: this.owner,
    }).then((destination) => {
      const lamportsPerSignature = this.cache.lamportsPerSignature;
      const minimumTokenAccountBalance = this.cache.minimumTokenAccountBalance;

      if (!lamportsPerSignature || !minimumTokenAccountBalance) {
        throw FeeRelayerError.relayInfoMissing();
      }

      const needsCreateDestinationTokenAccount = destination.needCreateDestination;

      const expectedFee = SolanaSDK.FeeAmount.zero();

      // fee for payer's signature
      expectedFee.transaction = new u64(expectedFee.transaction.add(lamportsPerSignature));

      // fee for owner's signature
      expectedFee.transaction = new u64(expectedFee.transaction.add(lamportsPerSignature));

      // when source token is native SOL
      if (sourceTokenMint.equals(SolanaSDKPublicKey.wrappedSOLMint)) {
        // WSOL's signature
        expectedFee.transaction = new u64(expectedFee.transaction.add(lamportsPerSignature));
      }

      // when needed to create destination
      if (
        needsCreateDestinationTokenAccount &&
        !destinationTokenMint.equals(SolanaSDKPublicKey.wrappedSOLMint)
      ) {
        expectedFee.accountBalances = new u64(
          expectedFee.accountBalances.add(minimumTokenAccountBalance),
        );
      }

      // when destination is native SOL
      if (destinationTokenMint.equals(SolanaSDKPublicKey.wrappedSOLMint)) {
        expectedFee.transaction = new u64(expectedFee.transaction.add(lamportsPerSignature));
      }

      // in transitive swap, there will be situation when swapping from SOL -> SPL that needs spliting transaction to 2 transactions
      if (
        swapPools?.length === 2 &&
        sourceTokenMint.equals(SolanaSDKPublicKey.wrappedSOLMint) &&
        destinationAddress === null
      ) {
        expectedFee.transaction = new u64(
          expectedFee.transaction.add(lamportsPerSignature.muln(2)),
        );
      }

      return expectedFee;
    });
  }

  private async _prepareSwapTransaction({
    network,
    sourceToken,
    destinationToken,
    // userDestinationAccountOwnerAddress,

    pools,
    inputAmount,
    slippage,

    // feeAmount,
    blockhash,
    minimumTokenAccountBalance,
    needsCreateDestinationTokenAccount,
    feePayerAddress,
    // lamportsPerSignature,

    needsCreateTransitTokenAccount,
    transitTokenMintPubkey,
  }: // transitTokenAccountAddress,
  {
    network: Network;
    sourceToken: TokenAccount;
    destinationToken: TokenAccount;
    // userDestinationAccountOwnerAddress?: string;

    pools: OrcaSwap.PoolsPair;
    inputAmount: u64;
    slippage: number;

    // feeAmount: u64;
    blockhash: string;
    minimumTokenAccountBalance: u64;
    needsCreateDestinationTokenAccount: boolean;
    feePayerAddress: string;
    // lamportsPerSignature: u64;

    needsCreateTransitTokenAccount?: boolean | null;
    transitTokenMintPubkey?: PublicKey | null;
    // transitTokenAccountAddress?: PublicKey;
  }): Promise<{
    transactions: SolanaSDK.PreparedTransaction[];
    additionalPaybackFee: u64;
  }> {
    // assertion
    const userAuthorityAddress = this.owner;
    let userSourceTokenAccountAddress = new PublicKey(sourceToken.address);
    const sourceTokenMintAddress = new PublicKey(sourceToken.mint);
    const feePayerAddressNew = new PublicKey(feePayerAddress);
    const associatedTokenAddress = await Token.getAssociatedTokenAddress(
      SolanaSDKPublicKey.splAssociatedTokenAccountProgramId,
      SolanaSDKPublicKey.tokenProgramId,
      sourceTokenMintAddress,
      feePayerAddressNew,
    );
    if (
      !userAuthorityAddress ||
      !userSourceTokenAccountAddress ||
      !sourceTokenMintAddress ||
      !feePayerAddressNew ||
      !associatedTokenAddress ||
      userSourceTokenAccountAddress !== associatedTokenAddress
    ) {
      throw FeeRelayerError.wrongAddress();
    }

    const destinationTokenMintAddress = new PublicKey(destinationToken.mint);

    // forming transaction and count fees
    let additionalTransaction: SolanaSDK.PreparedTransaction | null = null;
    let accountCreationFee: SolanaSDK.Lamports = ZERO;
    const instructions: TransactionInstruction[] = [];
    let additionalPaybackFee: u64 = ZERO;

    // check source
    let sourceWSOLNewAccount: Account | null = null;
    if (sourceToken.mint.equals(SolanaSDKPublicKey.wrappedSOLMint)) {
      sourceWSOLNewAccount = new Account();
      instructions.push(
        ...[
          SystemProgram.transfer({
            fromPubkey: userAuthorityAddress,
            toPubkey: feePayerAddressNew,
            lamports: inputAmount.toNumber(),
          }),
          SystemProgram.createAccount({
            fromPubkey: feePayerAddressNew,
            newAccountPubkey: sourceWSOLNewAccount.publicKey,
            lamports: minimumTokenAccountBalance.add(inputAmount).toNumber(),
            space: SolanaSDK.AccountInfo.span,
            programId: SolanaSDKPublicKey.tokenProgramId,
          }),
          Token.createInitAccountInstruction(
            SolanaSDKPublicKey.tokenProgramId,
            SolanaSDKPublicKey.wrappedSOLMint,
            sourceWSOLNewAccount.publicKey,
            userAuthorityAddress,
          ),
        ],
      );
      userSourceTokenAccountAddress = sourceWSOLNewAccount.publicKey;
      additionalPaybackFee = new u64(additionalPaybackFee.add(minimumTokenAccountBalance));
    }

    // check destination
    let destinationNewAccount: Account | null = null;
    let userDestinationTokenAccountAddress = destinationToken.address;
    if (needsCreateDestinationTokenAccount) {
      if (destinationTokenMintAddress.equals(SolanaSDKPublicKey.wrappedSOLMint)) {
        // For native solana, create and initialize WSOL
        destinationNewAccount = new Account();
        instructions.push(
          ...[
            SystemProgram.createAccount({
              fromPubkey: feePayerAddressNew,
              newAccountPubkey: destinationNewAccount.publicKey,
              lamports: minimumTokenAccountBalance.toNumber(),
              space: SolanaSDK.AccountInfo.span,
              programId: SolanaSDKPublicKey.tokenProgramId,
            }),
            Token.createInitAccountInstruction(
              SolanaSDKPublicKey.tokenProgramId,
              destinationTokenMintAddress,
              destinationNewAccount.publicKey,
              userAuthorityAddress,
            ),
          ],
        );
        userDestinationTokenAccountAddress = destinationNewAccount.publicKey;
        accountCreationFee = new u64(accountCreationFee.add(minimumTokenAccountBalance));
      } else {
        // For other token, create associated token address
        const associatedAddress = await Token.getAssociatedTokenAddress(
          SolanaSDKPublicKey.splAssociatedTokenAccountProgramId,
          SolanaSDKPublicKey.tokenProgramId,
          destinationTokenMintAddress,
          userAuthorityAddress,
        );

        const instruction = Token.createAssociatedTokenAccountInstruction(
          SolanaSDKPublicKey.splAssociatedTokenAccountProgramId,
          SolanaSDKPublicKey.tokenProgramId,
          destinationTokenMintAddress,
          associatedAddress,
          userAuthorityAddress,
          feePayerAddressNew,
        );

        // SPECIAL CASE WHEN WE SWAP FROM SOL TO NON-CREATED SPL TOKEN, THEN WE NEEDS ADDITIONAL TRANSACTION BECAUSE TRANSACTION IS TOO LARGE
        if (sourceWSOLNewAccount) {
          additionalTransaction = await this._prepareTransaction({
            owner: this.owner, // instead of signers with owner
            instructions: [instruction],
            blockhash,
            feePayerAddress: feePayerAddressNew,
            accountCreationFee: minimumTokenAccountBalance,
          });
        } else {
          instructions.push(instruction);
          accountCreationFee = new u64(accountCreationFee.add(minimumTokenAccountBalance));
        }
        userDestinationTokenAccountAddress = associatedAddress;
      }
    }

    // swap
    const swap = this.prepareSwapData({
      pools,
      inputAmount,
      minAmountOut: null,
      slippage,
      transitTokenMintPubkey,
      needsCreateTransitTokenAccount: needsCreateTransitTokenAccount === true,
    });
    const userTransferAuthority = swap.transferAuthorityAccount?.publicKey;

    const swapNew = swap.swapData;
    switch (swapNew.constructor) {
      case DirectSwapData: {
        const pool = pools[0];
        if (!pool) {
          throw FeeRelayerError.swapPoolsNotFound();
        }

        // approve
        if (userTransferAuthority) {
          instructions.push(
            Token.createApproveInstruction(
              SolanaSDKPublicKey.tokenProgramId,
              userSourceTokenAccountAddress,
              userTransferAuthority,
              userAuthorityAddress,
              [],
              (swapNew as DirectSwapData).amountIn,
            ),
          );
        }

        break;
      }
      case TransitiveSwapData: {
        // approve
        if (userTransferAuthority) {
          instructions.push(
            Token.createApproveInstruction(
              SolanaSDKPublicKey.tokenProgramId,
              userSourceTokenAccountAddress,
              userTransferAuthority,
              userAuthorityAddress,
              [],
              (swapNew as TransitiveSwapData).from.amountIn,
            ),
          );
        }

        // create transit token account
        const transitTokenMint = new PublicKey(
          (swapNew as TransitiveSwapData).transitTokenMintPubkey,
        );
        const transitTokenAccountAddressNew = FeeRelayerRelayProgram.getTransitTokenAccountAddress({
          user: userAuthorityAddress,
          transitTokenMint,
          network,
        });

        if (needsCreateTransitTokenAccount) {
          instructions.push(
            FeeRelayerRelayProgram.createTransitTokenAccountInstruction({
              feePayer: feePayerAddressNew,
              userAuthority: userAuthorityAddress,
              transitTokenAccount: transitTokenAccountAddressNew,
              transitTokenMint,
              network,
            }),
          );
        }

        // relay swap
        instructions.push(
          FeeRelayerRelayProgram.createRelaySwapInstruction({
            transitiveSwap: swapNew as TransitiveSwapData,
            userAuthorityAddressPubkey: userAuthorityAddress,
            sourceAddressPubkey: userSourceTokenAccountAddress,
            transitTokenAccount: transitTokenAccountAddressNew,
            destinationAddressPubkey: new PublicKey(userDestinationTokenAccountAddress),
            feePayerPubkey: feePayerAddressNew,
            network,
          }),
        );
        break;
      }
      default:
        throw new Error('unsupported swap type');
    }

    // WSOL close
    // close source
    const newAccount = sourceWSOLNewAccount;
    if (newAccount) {
      instructions.push(
        Token.createCloseAccountInstruction(
          SolanaSDKPublicKey.tokenProgramId,
          newAccount.publicKey,
          userAuthorityAddress,
          userAuthorityAddress,
          [],
        ),
      );
    }
    // close destination
    const newAccountNew = destinationNewAccount;
    if (newAccountNew && destinationTokenMintAddress.equals(SolanaSDKPublicKey.wrappedSOLMint)) {
      instructions.push(
        ...[
          Token.createCloseAccountInstruction(
            SolanaSDKPublicKey.tokenProgramId,
            newAccountNew.publicKey,
            userAuthorityAddress,
            userAuthorityAddress,
            [],
          ),
          SystemProgram.transfer({
            fromPubkey: userAuthorityAddress,
            toPubkey: feePayerAddressNew,
            lamports: minimumTokenAccountBalance.toNumber(),
          }),
        ],
      );
      accountCreationFee = new u64(accountCreationFee.sub(minimumTokenAccountBalance));
    }

    // resign transaction
    const signers: Account[] = []; // TODO: this.owner
    if (sourceWSOLNewAccount) {
      signers.push(sourceWSOLNewAccount);
    }
    if (destinationNewAccount) {
      signers.push(destinationNewAccount);
    }

    const transactions: SolanaSDK.PreparedTransaction[] = [];

    if (additionalTransaction) {
      transactions.push(additionalTransaction);
    }
    transactions.push(
      await this._prepareTransaction({
        owner: this.owner,
        instructions,
        signers,
        blockhash,
        feePayerAddress: feePayerAddressNew,
        accountCreationFee,
      }),
    );

    return {
      transactions,
      additionalPaybackFee,
    };
  }

  private async _prepareTransaction({
    owner,
    instructions,
    signers = [],
    blockhash,
    feePayerAddress,
    accountCreationFee,
  }: {
    owner: PublicKey;
    instructions: TransactionInstruction[];
    signers?: Account[];
    blockhash: string;
    feePayerAddress: PublicKey;
    accountCreationFee: u64;
    // lamportsPerSignature: u64;
  }): Promise<SolanaSDK.PreparedTransaction> {
    const transaction = new Transaction();
    transaction.instructions = instructions;
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = feePayerAddress;

    transaction.sign(...signers);

    // calculate fee first
    const estimatedFee = new u64(
      await transaction.getEstimatedFee(this.solanaClient.provider.connection),
    );
    const expectedFee = new SolanaSDK.FeeAmount({
      transaction: estimatedFee,
      accountBalances: accountCreationFee,
    });

    const decodedTransaction = JSON.stringify(transaction);
    Logger.log(decodedTransaction, LogEvent.info);

    return new SolanaSDK.PreparedTransaction({
      owner,
      transaction,
      signers,
      expectedFee,
    });
  }

  private _prepareForTopUpAndSwap({
    sourceToken,
    destinationTokenMint,
    destinationAddress,
    payingFeeToken,
    swapPools,
    reuseCache,
  }: {
    sourceToken: TokenAccount;
    destinationTokenMint: PublicKey;
    destinationAddress?: PublicKey;
    payingFeeToken?: TokenAccount;
    swapPools: OrcaSwap.PoolsPair;
    reuseCache: boolean;
  }): Promise<TopUpAndActionPreparedParams> {
    const relayAccountStatus = this.cache.relayAccountStatus;
    const freeTransactionFeeLimit = this.cache.freeTransactionFeeLimit;
    if (!relayAccountStatus || !freeTransactionFeeLimit) {
      throw FeeRelayerError.relayInfoMissing();
    }

    // form request
    let request: Promise<TopUpAndActionPreparedParams>;
    const cachedPreparedParams = this.cache.preparedParams;
    if (reuseCache && cachedPreparedParams) {
      request = Promise.resolve(cachedPreparedParams);
    } else {
      let tradablePoolsPairRequest: Promise<OrcaSwap.PoolsPair[]>;
      if (payingFeeToken) {
        tradablePoolsPairRequest = this.orcaSwapClient.getTradablePoolsPairs({
          fromMint: payingFeeToken.mint.toString(),
          toMint: SolanaSDKPublicKey.wrappedSOLMint.toString(),
        });
      } else {
        tradablePoolsPairRequest = Promise.resolve([]);
      }

      request = Promise.all([
        tradablePoolsPairRequest,
        this.calculateSwappingNetworkFees({
          swapPools,
          sourceTokenMint: sourceToken.mint,
          destinationTokenMint,
          destinationAddress,
        }),
      ])
        .then(([tradableTopUpPoolsPair, swappingFee]) => {
          // TOP UP
          let topUpPreparedParam: TopUpPreparedParams | null;

          if (payingFeeToken?.mint.equals(SolanaSDKPublicKey.wrappedSOLMint)) {
            topUpPreparedParam = null;
          } else {
            const relayAccountBalance = relayAccountStatus.balance;
            if (relayAccountBalance && relayAccountBalance.gte(swappingFee.total)) {
              topUpPreparedParam = null;
            }
            // STEP 2.2: Else
            else {
              // Get real amounts needed for topping up
              const topUpAmount = this._calculateNeededTopUpAmount({
                expectedFee: swappingFee,
                payingTokenMint: payingFeeToken?.mint,
                relayAccountStatus,
                freeTransactionFeeLimit,
              }).total;

              const expectedFee = this.calculateExpectedFeeForTopUp({
                relayAccountStatus,
                freeTransactionFeeLimit,
              });

              // Get pools
              let topUpPools: OrcaSwap.PoolsPair;
              const bestPools = this.orcaSwapClient.findBestPoolsPairForEstimatedAmount({
                estimatedAmount: topUpAmount,
                poolsPairs: tradableTopUpPoolsPair,
              });
              if (bestPools) {
                topUpPools = bestPools;
              } else {
                throw FeeRelayerError.swapPoolsNotFound();
              }

              topUpPreparedParam = new TopUpPreparedParams({
                amount: topUpAmount,
                expectedFee: expectedFee,
                poolsPair: topUpPools,
              });
            }
          }

          return new TopUpAndActionPreparedParams({
            topUpPreparedParam,
            actionFeesAndPools: new FeesAndPools({ fee: swappingFee, poolsPair: swapPools }),
          });
        })
        .then((preparedParams) => {
          this.cache.preparedParams = preparedParams;

          return preparedParams;
        });
    }

    // get tradable poolspair for top up
    return request;
  }

  // FeeRelayerRelayNativeSwap
  calculateNeededTopUpAmountNative({
    swapTransactions,
    payingTokenMint,
  }: {
    swapTransactions: OrcaSwap.PreparedSwapTransaction[];
    payingTokenMint?: PublicKey;
  }): Promise<SolanaSDK.FeeAmount> {
    const lamportsPerSignature = this.cache.lamportsPerSignature;
    if (!lamportsPerSignature) {
      throw FeeRelayerError.relayInfoMissing();
    }

    // transaction fee
    const transactionFee = new u64(swapTransactions.length).muln(2).mul(lamportsPerSignature);

    // account creation fee
    const accountCreationFee = swapTransactions.reduce((acc, curr) => {
      return acc.add(curr.accountCreationFee);
    }, ZERO);

    const expectedFee = new SolanaSDK.FeeAmount({
      transaction: transactionFee,
      accountBalances: accountCreationFee,
    });
    return this.calculateNeededTopUpAmount({ expectedFee, payingTokenMint });
  }

  topUpAndSwap({
    swapTransactions,
    feePayer,
    payingFeeToken,
  }: {
    swapTransactions: OrcaSwap.PreparedSwapTransaction[];
    feePayer: PublicKey;
    payingFeeToken?: TokenAccount;
  }): Promise<string[]> {
    return Promise.all([
      this.updateRelayAccountStatus(),
      this.updateFreeTransactionFeeLimit(),
      this.calculateNeededTopUpAmountNative({
        swapTransactions,
        payingTokenMint: payingFeeToken?.mint,
      }),
    ])
      .then(([, , expectedFee]): Promise<string[] | null> => {
        return this.checkAndTopUp({
          expectedFee,
          payingFeeToken,
        });
      })
      .then(() => {
        if (!swapTransactions.length || swapTransactions.length > 2) {
          throw OrcaSwapError.invalidNumberOfTransactions();
        }

        const request = this._prepareAndSend({
          swapTransaction: swapTransactions[0]!,
          feePayer: feePayer ?? this.owner,
          payingFeeToken,
        });

        if (swapTransactions.length === 2) {
          return request.then(() => {
            return promiseRetry(
              (_retry) => {
                return this._prepareAndSend({
                  swapTransaction: swapTransactions[1]!,
                  feePayer: feePayer ?? this.owner,
                  payingFeeToken: payingFeeToken,
                }).catch((error: Error) => {
                  if (error) {
                    // TODO: some conditions to make retry
                  }

                  throw error;
                });
              },
              {
                minTimeout: 1000,
                maxTimeout: 60000,
                factor: 1,
              },
            );
          });
        }

        return request;
      });
  }

  // FeeRelayerRelayNativeSwap Helpers
  private _prepareAndSend({
    swapTransaction,
    feePayer,
    payingFeeToken,
  }: {
    swapTransaction: OrcaSwap.PreparedSwapTransaction;
    feePayer: PublicKey;
    payingFeeToken?: TokenAccount;
  }): Promise<string[]> {
    return this.solanaClient
      .prepareTransaction({
        owner: this.owner,
        instructions: swapTransaction.instructions,
        signers: swapTransaction.signers,
        feePayer,
        // accountsCreationFee: swapTransaction.accountCreationFee,
        // recentBlockhash: null,
      })
      .then((preparedTransaction) => {
        return this.relayTransaction({
          preparedTransaction,
          payingFeeToken,
          relayAccountStatus: this.cache.relayAccountStatus ?? RelayAccountStatus.notYetCreated(),
          additionalPaybackFee: ZERO,
          operationType: StatsInfoOperationType.swap,
          currency: null, // TODO: - Which?
        });
      });
  }

  // FeeRelayerRelayTopUp

  async topUp({
    needsCreateUserRelayAddress,
    sourceToken,
    targetAmount,
    topUpPools,
    expectedFee,
  }: {
    needsCreateUserRelayAddress: boolean;
    sourceToken: TokenAccount;
    targetAmount: u64;
    topUpPools: OrcaSwap.PoolsPair;
    expectedFee: u64;
  }): Promise<string[]> {
    const transitToken = TransitTokenAccountAnalysator.getTransitToken({
      solanaApiClient: this.solanaClient,
      orcaSwap: this.orcaSwapClient,
      account: this.owner,
      pools: topUpPools,
    });

    const needsCreateTransitTokenAccount =
      await TransitTokenAccountAnalysator.checkIfNeedsCreateTransitTokenAccount({
        solanaApiClient: this.solanaClient,
        transitToken,
      });

    const [blockhash, _] = await Promise.all([
      this.solanaClient.getRecentBlockhash(),
      this.updateFreeTransactionFeeLimit(),
    ]);

    const minimumRelayAccountBalance = this.cache.minimumRelayAccountBalance;
    const minimumTokenAccountBalance = this.cache.minimumTokenAccountBalance;
    const feePayerAddress = this.cache.feePayerAddress;
    const lamportsPerSignature = this.cache.lamportsPerSignature;
    const freeTransactionFeeLimit = this.cache.freeTransactionFeeLimit;

    if (
      !minimumRelayAccountBalance ||
      !minimumTokenAccountBalance ||
      !feePayerAddress ||
      !lamportsPerSignature ||
      !freeTransactionFeeLimit
    ) {
      throw FeeRelayerError.relayInfoMissing();
    }

    // STEP 3: prepare for topUp
    const topUpTransaction = await this.prepareForTopUp({
      network: this.solanaClient.endpoint.network,
      sourceToken,
      userAuthorityAddress: this.owner,
      userRelayAddress: FeeRelayerRelayProgram.getUserRelayAddress({
        user: this.owner,
        network: this.solanaClient.endpoint.network,
      }),
      topUpPools,
      targetAmount,
      expectedFee,
      blockhash,
      minimumRelayAccountBalance,
      minimumTokenAccountBalance,
      needsCreateUserRelayAccount: needsCreateUserRelayAddress,
      feePayerAddress,
      needsCreateTransitTokenAccount,
      transitTokenMintPubkey: transitToken?.mint ? new PublicKey(transitToken.mint) : null,
      transitTokenAccountAddress: transitToken?.address
        ? new PublicKey(transitToken.address)
        : null,
    });

    // STEP 4: send transaction
    const signatures = topUpTransaction.preparedTransaction.transaction.signatures;
    console.log(555);
    signatures.map((a) => console.log(a.publicKey.toString(), a.signature));
    if (signatures.length < 2) {
      throw FeeRelayerError.invalidSignature();
    }

    // the second signature is the owner's signature
    const ownerSignature = getSignature(signatures, 1);

    // the third signature (optional) is the transferAuthority's signature
    let transferAuthoritySignature = null;
    try {
      transferAuthoritySignature = getSignature(signatures, 2);
    } catch {
      // ignore
    }

    const topUpSignatures = new SwapTransactionSignatures({
      userAuthoritySignature: ownerSignature,
      transferAuthoritySignature,
    });

    const result = await this.feeRelayerAPIClient.sendTransaction(
      FeeRelayerRequestType.relayTopUpWithSwap(
        new TopUpWithSwapParams({
          userSourceTokenAccountPubkey: sourceToken.address,
          sourceTokenMintPubkey: sourceToken.mint,
          userAuthorityPubkey: this.owner,
          topUpSwap: new SwapData(topUpTransaction.swapData),
          feeAmount: expectedFee,
          signatures: topUpSignatures,
          blockhash,
          deviceType: this.deviceType,
          buildNumber: this.buildNumber,
        }),
      ),
    );

    return [result];
  }

  // FeeRelayerRelayTopUp Helpers
  async prepareForTopUpCheck({
    topUpAmount,
    payingFeeToken,
    relayAccountStatus,
    freeTransactionFeeLimit,
    forceUsingTransitiveSwap = false, // true for testing purpose only
  }: {
    topUpAmount: SolanaSDK.Lamports;
    payingFeeToken: TokenAccount;
    relayAccountStatus: RelayAccountStatus;
    freeTransactionFeeLimit?: FreeTransactionFeeLimit;
    forceUsingTransitiveSwap?: boolean;
  }): Promise<TopUpPreparedParams | null> {
    // form request
    const tradableTopUpPoolsPair = await this.orcaSwapClient.getTradablePoolsPairs({
      fromMint: payingFeeToken.mint.toString(),
      toMint: SolanaSDKPublicKey.wrappedSOLMint.toString(),
    });

    // Get fee
    const expectedFee = this.calculateExpectedFeeForTopUp({
      relayAccountStatus,
      freeTransactionFeeLimit,
    });
    // Get pools for topping up
    let topUpPools: OrcaSwap.PoolsPair;
    // force using transitive swap (for testing only)
    if (forceUsingTransitiveSwap) {
      const pools = tradableTopUpPoolsPair.find((pair) => pair.length === 2)!;
      topUpPools = pools;
    } else {
      // prefer direct swap to transitive swap
      const directSwapPools = tradableTopUpPoolsPair.find((pair) => pair.length === 1);
      if (directSwapPools) {
        topUpPools = directSwapPools;
      } else {
        // if direct swap is not available, use transitive swap
        const transitiveSwapPools = this.orcaSwapClient.findBestPoolsPairForEstimatedAmount({
          estimatedAmount: topUpAmount,
          poolsPairs: tradableTopUpPoolsPair,
        });
        if (transitiveSwapPools) {
          topUpPools = transitiveSwapPools;
        }
        // no swap is available
        else {
          throw FeeRelayerError.swapPoolsNotFound();
        }
      }
    }

    // return needed amount and pools
    return new TopUpPreparedParams({
      amount: topUpAmount,
      expectedFee,
      poolsPair: topUpPools,
    });
  }

  calculateExpectedFeeForTopUp({
    relayAccountStatus,
    freeTransactionFeeLimit,
  }: {
    freeTransactionFeeLimit?: FreeTransactionFeeLimit;
    relayAccountStatus: RelayAccountStatus;
  }): u64 {
    // get cache
    const minimumRelayAccountBalance = this.cache.minimumRelayAccountBalance;
    const lamportsPerSignature = this.cache.lamportsPerSignature;
    const minimumTokenAccountBalance = this.cache.minimumTokenAccountBalance;
    if (!minimumRelayAccountBalance || !lamportsPerSignature || !minimumTokenAccountBalance) {
      throw FeeRelayerError.relayInfoMissing();
    }

    let expectedFee: u64 = ZERO;
    if (relayAccountStatus.type === RelayAccountStatusType.notYetCreated) {
      expectedFee = expectedFee.add(minimumRelayAccountBalance);
    }

    const transactionNetworkFee = new u64(2).mul(lamportsPerSignature);
    if (
      !freeTransactionFeeLimit?.isFreeTransactionFeeAvailable({
        transactionFee: transactionNetworkFee,
      })
    ) {
      expectedFee = expectedFee.add(transactionNetworkFee);
    }

    expectedFee = expectedFee.add(minimumTokenAccountBalance);
    return new u64(expectedFee.toString());
  }

  /// Prepare transaction and expected fee for a given relay transaction
  async prepareForTopUp({
    network,
    sourceToken,
    userAuthorityAddress,
    userRelayAddress,
    topUpPools,
    targetAmount,
    expectedFee,
    blockhash,
    minimumRelayAccountBalance,
    minimumTokenAccountBalance,
    needsCreateUserRelayAccount,
    feePayerAddress,
    // lamportsPerSignature,
    // freeTransactionFeeLimit,
    needsCreateTransitTokenAccount = false,
    transitTokenMintPubkey,
    transitTokenAccountAddress,
  }: {
    network: Network;
    sourceToken: TokenAccount;
    userAuthorityAddress: PublicKey;
    userRelayAddress: PublicKey;
    topUpPools: OrcaSwap.PoolsPair;
    targetAmount: u64;
    expectedFee: u64;
    blockhash: string;
    minimumRelayAccountBalance: u64;
    minimumTokenAccountBalance: u64;
    needsCreateUserRelayAccount: boolean;
    feePayerAddress: string;
    // lamportsPerSignature: u64;
    // freeTransactionFeeLimit?: FreeTransactionFeeLimit;
    needsCreateTransitTokenAccount?: boolean | null;
    transitTokenMintPubkey?: PublicKey | null;
    transitTokenAccountAddress?: PublicKey | null;
  }): Promise<{
    swapData: FeeRelayerRelaySwapType;
    preparedTransaction: SolanaSDK.PreparedTransaction;
  }> {
    // assertion
    const userSourceTokenAccountAddress = new PublicKey(sourceToken.address);
    const sourceTokenMintAddress = new PublicKey(sourceToken.mint);
    const feePayerAddressNew = new PublicKey(feePayerAddress);
    let associatedTokenAddress;
    try {
      associatedTokenAddress = getAssociatedTokenAddressSync(
        sourceTokenMintAddress,
        feePayerAddressNew,
      );
    } catch {
      throw FeeRelayerError.unknown();
    }

    if (userSourceTokenAccountAddress.equals(associatedTokenAddress)) {
      throw FeeRelayerError.wrongAddress();
    }

    // forming transaction and count fees
    let accountCreationFee: u64 = ZERO;
    const instructions: TransactionInstruction[] = [];

    // create user relay account
    if (needsCreateUserRelayAccount) {
      instructions.push(
        SystemProgram.transfer({
          fromPubkey: feePayerAddressNew,
          toPubkey: userRelayAddress,
          lamports: minimumRelayAccountBalance.toNumber(),
        }),
      );
      accountCreationFee = new u64(accountCreationFee.add(minimumRelayAccountBalance));
    }

    // top up swap
    const swap = this.prepareSwapData({
      pools: topUpPools,
      inputAmount: null,
      minAmountOut: targetAmount,
      slippage: 0.03,
      transitTokenMintPubkey,
      needsCreateTransitTokenAccount: needsCreateTransitTokenAccount === true,
    });
    const userTransferAuthority = swap.transferAuthorityAccount?.publicKey;

    const swapNew = swap.swapData;
    switch (swapNew.constructor) {
      case DirectSwapData: {
        accountCreationFee = new u64(accountCreationFee.add(minimumTokenAccountBalance));
        // approve
        if (userTransferAuthority) {
          instructions.push(
            Token.createApproveInstruction(
              SolanaSDKPublicKey.tokenProgramId,
              userSourceTokenAccountAddress,
              userTransferAuthority,
              userAuthorityAddress,
              [],
              (swapNew as DirectSwapData).amountIn,
            ),
          );
        }

        // top up
        instructions.push(
          FeeRelayerRelayProgram.topUpSwapInstruction({
            network,
            topUpSwap: swapNew,
            userAuthorityAddress,
            userSourceTokenAccountAddress,
            feePayerAddress: feePayerAddressNew,
          }),
        );

        break;
      }

      case TransitiveSwapData: {
        // approve
        if (userTransferAuthority) {
          instructions.push(
            Token.createApproveInstruction(
              SolanaSDKPublicKey.tokenProgramId,
              userSourceTokenAccountAddress,
              userTransferAuthority,
              userAuthorityAddress,
              [],
              (swapNew as TransitiveSwapData).from.amountIn,
            ),
          );
        }

        // create transit token account
        if (needsCreateTransitTokenAccount && transitTokenAccountAddress) {
          instructions.push(
            FeeRelayerRelayProgram.createTransitTokenAccountInstruction({
              feePayer: feePayerAddressNew,
              userAuthority: userAuthorityAddress,
              transitTokenAccount: transitTokenAccountAddress,
              transitTokenMint: (swapNew as TransitiveSwapData).transitTokenMintPubkey,
              network,
            }),
          );
        }

        // Destination WSOL account funding
        accountCreationFee = new u64(accountCreationFee.add(minimumTokenAccountBalance));

        // top up
        instructions.push(
          FeeRelayerRelayProgram.topUpSwapInstruction({
            network,
            topUpSwap: swapNew,
            userAuthorityAddress,
            userSourceTokenAccountAddress,
            feePayerAddress: feePayerAddressNew,
          }),
        );

        break;
      }
      default:
        throw new Error('unsupported swap type');
    }

    // transfer
    instructions.push(
      FeeRelayerRelayProgram.transferSolInstruction({
        userAuthorityAddress,
        recipient: feePayerAddressNew,
        lamports: expectedFee,
        network,
      }),
    );

    const transaction = new Transaction();
    transaction.instructions = instructions;
    transaction.feePayer = feePayerAddressNew;
    transaction.recentBlockhash = blockhash;

    // calculate fee first
    const estimatedFee = await transaction.getEstimatedFee(this.solanaClient.provider.connection);
    const expectedFeeNew = new SolanaSDK.FeeAmount({
      transaction: new u64(estimatedFee),
      accountBalances: accountCreationFee,
    });

    // resign transaction
    const signers: Account[] = [];
    const tranferAuthority = swap.transferAuthorityAccount;
    if (tranferAuthority) {
      signers.push(tranferAuthority);
    }
    if (signers.length !== 0) {
      transaction.sign(...signers);
    }

    console.log(
      444,
      signers.map((signer) => signer.publicKey.toString()),
    );

    const signedTransaction = await this.solanaClient.provider.wallet.signTransaction(transaction);

    // const decodedTransaction = JSON.stringify(transaction);
    // Logger.log(decodedTransaction, LogEvent.info);

    return {
      swapData: swap.swapData,
      preparedTransaction: new SolanaSDK.PreparedTransaction({
        owner: this.owner,
        transaction: signedTransaction,
        signers,
        expectedFee: expectedFeeNew,
      }),
    };
  }

  // Helpers

  async checkAndTopUp({
    expectedFee,
    payingFeeToken,
  }: {
    expectedFee: SolanaSDK.FeeAmount;
    payingFeeToken?: TokenAccount | null;
  }): Promise<string[] | null> {
    // if paying fee token is solana, skip the top up
    if (payingFeeToken?.mint.equals(SolanaSDKPublicKey.wrappedSOLMint)) {
      return Promise.resolve(null);
    }

    const [relayAccountStatus, freeTransactionFeeLimit] = await Promise.all([
      this.getRelayAccountStatus(),
      this.getFreeTransactionFeeLimit(),
    ]);

    const topUpAmount = this._calculateNeededTopUpAmount({
      expectedFee,
      payingTokenMint: payingFeeToken?.mint,
      freeTransactionFeeLimit,
      relayAccountStatus,
    });

    let params: TopUpPreparedParams | null;
    let needsCreateUserRelayAddress: boolean;

    // no need to top up
    if (topUpAmount.total.lten(0)) {
      // no need to top up
      [params, needsCreateUserRelayAddress] = [
        null,
        relayAccountStatus.type === RelayAccountStatusType.notYetCreated,
      ];
    } else {
      // top up
      if (!payingFeeToken) {
        throw FeeRelayerError.unknown();
      }

      const prepareResult = await this.prepareForTopUpCheck({
        topUpAmount: topUpAmount.total,
        payingFeeToken,
        relayAccountStatus,
        freeTransactionFeeLimit,
      });

      [params, needsCreateUserRelayAddress] = [
        prepareResult,
        relayAccountStatus.type === RelayAccountStatusType.notYetCreated,
      ];
    }

    const topUpParams = params;
    if (topUpParams && payingFeeToken) {
      return this.topUp({
        needsCreateUserRelayAddress,
        sourceToken: payingFeeToken,
        targetAmount: topUpParams.amount,
        topUpPools: topUpParams.poolsPair,
        expectedFee: topUpParams.expectedFee,
      });
    }

    return null;
  }

  async relayTransaction({
    preparedTransaction,
    payingFeeToken,
    relayAccountStatus,
    additionalPaybackFee,
    operationType,
    currency,
  }: {
    preparedTransaction: SolanaSDK.PreparedTransaction;
    payingFeeToken?: TokenAccount | null;
    relayAccountStatus: RelayAccountStatus;
    additionalPaybackFee: u64;
    operationType: StatsInfoOperationType;
    currency: string | null;
  }): Promise<TransactionID[]> {
    const feePayer = this.cache.feePayerAddress;

    // verify fee payer
    if (feePayer !== preparedTransaction.transaction.feePayer?.toString()) {
      throw FeeRelayerError.invalidFeePayer();
    }

    const freeTransactionFeeLimit = this.cache.freeTransactionFeeLimit;
    if (!feePayer || !freeTransactionFeeLimit) {
      throw FeeRelayerError.unauthorized();
    }

    // Calculate the fee to send back to feePayer
    // Account creation fee (accountBalances) is a must-pay-back fee
    let paybackFee = new u64(
      additionalPaybackFee.add(preparedTransaction.expectedFee.accountBalances),
    );

    // The transaction fee, on the other hand, is only be paid if user used more than number of free transaction fee
    if (
      !freeTransactionFeeLimit.isFreeTransactionFeeAvailable({
        transactionFee: preparedTransaction.expectedFee.transaction,
      })
    ) {
      paybackFee = new u64(paybackFee.add(preparedTransaction.expectedFee.transaction));
    }

    // transfer sol back to feerelayer's feePayer
    // TODO: check references
    const preparedTransactionNew = preparedTransaction;
    if (paybackFee.gtn(0)) {
      if (
        payingFeeToken?.mint.equals(SolanaSDKPublicKey.wrappedSOLMint) &&
        (relayAccountStatus.balance ?? ZERO).lt(paybackFee)
      ) {
        preparedTransactionNew.transaction.instructions.push(
          SystemProgram.transfer({
            fromPubkey: this.owner,
            toPubkey: new PublicKey(feePayer),
            lamports: paybackFee.toNumber(),
          }),
        );
      } else {
        preparedTransactionNew.transaction.instructions.push(
          FeeRelayerRelayProgram.transferSolInstruction({
            userAuthorityAddress: this.owner,
            recipient: new PublicKey(feePayer),
            lamports: paybackFee,
            network: this.solanaClient.endpoint.network,
          }),
        );
      }
    }

    // if (debug) {
    // const decodedTransaction = JSON.stringify(preparedTransactionNew.transaction);
    // Logger.log(decodedTransaction, LogEvent.info);
    // }

    // resign transaction
    if (preparedTransactionNew.signers.length > 0) {
      preparedTransactionNew.transaction.sign(...preparedTransactionNew.signers);
    }

    return [
      await this.feeRelayerAPIClient.sendTransaction(
        FeeRelayerRequestType.relayTransaction(new RelayTransactionParam(preparedTransactionNew)),
      ),
    ];
  }
}
