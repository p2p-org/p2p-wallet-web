/* eslint-disable no-console */

import { ZERO } from '@orca-so/sdk';
import type { Network } from '@saberhq/solana-contrib';
import {
  AccountLayout,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from '@solana/spl-token';
import type { TransactionInstruction } from '@solana/web3.js';
import { Account, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import promiseRetry from 'promise-retry';

import type { StatsInfoDeviceType } from 'new/sdk/FeeRelayer';
import { StatsInfo, StatsInfoOperationType } from 'new/sdk/FeeRelayer';
import type { FeeRelayerAPIClientType } from 'new/sdk/FeeRelayer/apiClient/FeeRelayerAPIClient';
import { FeeRelayerError } from 'new/sdk/FeeRelayer/models/FeeRelayerError';
import { FeeRelayerRequestType } from 'new/sdk/FeeRelayer/models/FeeRelayerRequestType';
import { getSwapData } from 'new/sdk/FeeRelayer/relay/helpers/FeeRelayerRelayExtensions';
import { FeeRelayerRelayProgram } from 'new/sdk/FeeRelayer/relay/RelayProgram/FeeRelayerRelayProgram';
import type * as OrcaSwap from 'new/sdk/OrcaSwap';
import { getInputAmountSlippage, OrcaSwapError } from 'new/sdk/OrcaSwap';
// import type { SolanaSDKAccountStorage } from 'new/sdk/SolanaSDK';
import * as SolanaSDK from 'new/sdk/SolanaSDK';
import { LogEvent, Logger, SolanaSDKPublicKey } from 'new/sdk/SolanaSDK';

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
  TokenInfo,
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
    payingTokenMint?: string;
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
    preparedTransaction,
    payingFeeToken,
    additionalPaybackFee,
    operationType,
    currency,
  }: {
    preparedTransaction: SolanaSDK.PreparedTransaction;
    payingFeeToken?: TokenInfo | null;
    additionalPaybackFee: u64;
    operationType: StatsInfoOperationType;
    currency: string | null;
  }): Promise<string[]>;

  /// Top up relay account (if needed) and relay mutiple transactions
  topUpAndRelayTransactions({
    preparedTransactions,
    payingFeeToken,
    additionalPaybackFee,
    operationType,
    currency,
  }: {
    preparedTransactions: SolanaSDK.PreparedTransaction[];
    payingFeeToken?: TokenInfo;
    additionalPaybackFee: u64;
    operationType: StatsInfoOperationType;
    currency: string | null;
  }): Promise<string[]>;

  /// SPECIAL METHODS FOR SWAP NATIVELY
  /// Calculate needed top up amount, specially for swapping
  calculateNeededTopUpAmountNative({
    swapTransactions,
    payingTokenMint,
  }: {
    swapTransactions: OrcaSwap.PreparedSwapTransaction[];
    payingTokenMint?: string;
  }): Promise<SolanaSDK.FeeAmount>;

  /// Top up relay account and swap natively
  topUpAndSwap({
    swapTransactions,
    feePayer,
    payingFeeToken,
  }: {
    swapTransactions: OrcaSwap.PreparedSwapTransaction[];
    feePayer: PublicKey;
    payingFeeToken?: TokenInfo;
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
    sourceTokenMint: string;
    destinationTokenMint: string;
    destinationAddress?: string;
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
    sourceToken: TokenInfo;
    destinationTokenMint: string;
    destinationAddress?: string;
    payingFeeToken: TokenInfo;
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
  apiClient: FeeRelayerAPIClientType;
  solanaClient: FeeRelayerRelaySolanaClient;
  // accountStorage: SolanaSDKAccountStorage;
  orcaSwapClient: OrcaSwap.OrcaSwapType;

  // Properties
  cache: Cache;
  owner: Account;
  userRelayAddress: PublicKey;
  deviceType: StatsInfoDeviceType;
  buildNumber: string | null;

  constructor({
    owner,
    apiClient,
    solanaClient,
    orcaSwapClient,
    deviceType,
    buildNumber,
  }: {
    owner: Account;
    apiClient: FeeRelayerAPIClientType;
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

    this.apiClient = apiClient;
    this.solanaClient = solanaClient;
    // this.accountStorage = accountStorage;
    this.orcaSwapClient = orcaSwapClient;
    this.owner = owner;
    this.userRelayAddress = FeeRelayerRelayProgram.getUserRelayAddress({
      user: this.owner.publicKey,
      network: this.solanaClient.endpoint.network,
    });
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
      this.apiClient.getFeePayerPubkey(),
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

  calculateNeededTopUpAmount({
    expectedFee,
    payingTokenMint,
  }: {
    expectedFee: SolanaSDK.FeeAmount;
    payingTokenMint?: string;
  }): Promise<SolanaSDK.FeeAmount> {
    return this.calculateMinNeededTopUpAmount({
      expectedFee,
      payingTokenMint,
    }).then((amount): SolanaSDK.FeeAmount => {
      // TODO: check references
      const amountNew = amount;
      // Correct amount if it's too small
      if (amountNew.total.ltn(1000)) {
        amountNew.transaction = amountNew.transaction.add(new u64(1000).sub(amountNew.total));
      }
      return amountNew;
    });
  }

  /// Calculate needed top up amount for expected fee
  calculateMinNeededTopUpAmount({
    expectedFee,
    payingTokenMint,
  }: {
    expectedFee: SolanaSDK.FeeAmount;
    payingTokenMint?: string;
  }): Promise<SolanaSDK.FeeAmount> {
    const neededAmount = expectedFee;

    // expected fees
    const expectedTopUpNetworkFee = new u64(2).mul(
      this.cache.lamportsPerSignature ?? new u64(5000),
    );
    const expectedTransactionNetworkFee = expectedFee.transaction;

    // real fees
    let neededTopUpNetworkFee = expectedTopUpNetworkFee;
    let neededTransactionNetworkFee = expectedTransactionNetworkFee;

    // is Top up free
    if (
      this.cache.freeTransactionFeeLimit?.isFreeTransactionFeeAvailable({
        transactionFee: expectedTopUpNetworkFee,
      })
    ) {
      neededTopUpNetworkFee = ZERO;
    }

    // is transaction free
    if (
      this.cache.freeTransactionFeeLimit?.isFreeTransactionFeeAvailable({
        transactionFee: expectedTopUpNetworkFee.add(expectedTransactionNetworkFee),
        forNextTransaction: true,
      })
    ) {
      neededTransactionNetworkFee = ZERO;
    }

    neededAmount.transaction = neededTopUpNetworkFee.add(neededTransactionNetworkFee);

    // check relay account balance
    if (neededAmount.total.gtn(0)) {
      const neededAmountWithoutCheckingRelayAccount = neededAmount;

      // for another token, check relay account status first
      return this.getRelayAccountStatus()
        .then((relayAccountStatus) => {
          // TODO: - Unknown fee when first time using fee relayer
          if (relayAccountStatus.type === RelayAccountStatusType.notYetCreated) {
            if (neededAmount.accountBalances.gtn(0)) {
              neededAmount.accountBalances = neededAmount.accountBalances.add(
                this.getRelayAccountCreationCost(),
              );
            } else {
              neededAmount.transaction = neededAmount.transaction.add(
                this.getRelayAccountCreationCost(),
              );
            }
          }

          // Check account balance
          let relayAccountBalance = relayAccountStatus.balance;
          if (relayAccountBalance && relayAccountBalance.gtn(0)) {
            // if relayAccountBalance has enough balance to cover transaction fee
            if (relayAccountBalance.gte(neededAmount.transaction)) {
              relayAccountBalance = relayAccountBalance.sub(neededAmount.transaction);
              neededAmount.transaction = ZERO;

              // if relayAccountBlance has enough balance to cover accountBalances fee too
              if (relayAccountBalance.gte(neededAmount.accountBalances)) {
                neededAmount.accountBalances = ZERO;
              }
              // Relay account balance can cover part of account creation fee
              else {
                neededAmount.accountBalances =
                  neededAmount.accountBalances.sub(relayAccountBalance);
              }
            }
            // if not, relayAccountBalance can cover part of transaction fee
            else {
              neededAmount.transaction = neededAmount.transaction.sub(relayAccountBalance);
            }
          }

          // if relay account could not cover all fees and paying token is WSOL, the compensation will be done without the existense of relay account
          if (
            neededAmount.total.gtn(0) &&
            payingTokenMint === SolanaSDKPublicKey.wrappedSOLMint.toString()
          ) {
            return neededAmountWithoutCheckingRelayAccount;
          }

          return neededAmount;
        })
        .catch(() => {
          return expectedFee;
        });
    }

    return Promise.resolve(neededAmount);
  }

  /// Calculate needed fee (count in payingToken)
  calculateFeeInPayingToken({
    feeInSOL,
    payingFeeTokenMint,
  }: {
    feeInSOL: SolanaSDK.FeeAmount;
    payingFeeTokenMint: string;
  }): Promise<SolanaSDK.FeeAmount> {
    if (payingFeeTokenMint === SolanaSDKPublicKey.wrappedSOLMint.toString()) {
      return Promise.resolve(feeInSOL);
    }
    return this.orcaSwapClient
      .getTradablePoolsPairs({
        fromMint: payingFeeTokenMint,
        toMint: SolanaSDKPublicKey.wrappedSOLMint.toString(),
      })
      .then((tradableTopUpPoolsPair) => {
        const topUpPools = this.orcaSwapClient.findBestPoolsPairForEstimatedAmount({
          estimatedAmount: feeInSOL.total,
          poolsPairs: tradableTopUpPoolsPair,
        });
        if (!topUpPools) {
          throw FeeRelayerError.swapPoolsNotFound();
        }

        const transactionFee = getInputAmountSlippage(topUpPools, feeInSOL.transaction, 0.01);
        const accountCreationFee = getInputAmountSlippage(
          topUpPools,
          feeInSOL.accountBalances,
          0.01,
        );

        return new SolanaSDK.FeeAmount({
          transaction: transactionFee ?? ZERO,
          accountBalances: accountCreationFee ?? ZERO,
        });
      });
  }

  /// Generic function for sending transaction to fee relayer's relay
  topUpAndRelayTransaction({
    preparedTransaction,
    payingFeeToken,
    additionalPaybackFee,
    operationType,
    currency,
  }: {
    preparedTransaction: SolanaSDK.PreparedTransaction;
    payingFeeToken?: TokenInfo | null;
    additionalPaybackFee: u64;
    operationType: StatsInfoOperationType;
    currency: string | null;
  }): Promise<string[]> {
    return this.topUpAndRelayTransactions({
      preparedTransactions: [preparedTransaction],
      payingFeeToken,
      additionalPaybackFee,
      operationType,
      currency,
    });
  }

  topUpAndRelayTransactions({
    preparedTransactions,
    payingFeeToken,
    additionalPaybackFee,
    operationType,
    currency,
  }: {
    preparedTransactions: SolanaSDK.PreparedTransaction[];
    payingFeeToken?: TokenInfo | null;
    additionalPaybackFee: u64;
    operationType: StatsInfoOperationType;
    currency: string | null;
  }): Promise<string[]> {
    return Promise.all([this.updateRelayAccountStatus(), this.updateFreeTransactionFeeLimit()])
      .then(() => {
        const expectedFees = preparedTransactions.map((tx) => tx.expectedFee);
        return this.checkAndTopUp({
          expectedFee: new SolanaSDK.FeeAmount({
            transaction: expectedFees
              .map((fee) => fee.transaction)
              .reduce((acc, val) => acc.add(val), ZERO),
            accountBalances: expectedFees
              .map((fee) => fee.accountBalances)
              .reduce((acc, val) => acc.add(val), ZERO),
          }),
          payingFeeToken,
        });
      })
      .then(async (topUpTxIds) => {
        // assertion
        if (!preparedTransactions.length) {
          throw FeeRelayerError.unknown();
        }

        const request: Promise<string[]> = this.relayTransaction({
          preparedTransaction: preparedTransactions[0]!,
          payingFeeToken,
          relayAccountStatus: this.cache.relayAccountStatus ?? RelayAccountStatus.notYetCreated(),
          additionalPaybackFee: preparedTransactions.length === 1 ? additionalPaybackFee : ZERO,
          operationType,
          currency,
        });

        if (preparedTransactions.length === 2) {
          return request.then(() => {
            return this.relayTransaction({
              preparedTransaction: preparedTransactions[1]!,
              payingFeeToken,
              relayAccountStatus:
                this.cache.relayAccountStatus ?? RelayAccountStatus.notYetCreated(),
              additionalPaybackFee,
              operationType,
              currency,
            });
          });
        }

        return request.catch((error) => {
          if (topUpTxIds !== null) {
            throw FeeRelayerError.topUpSuccessButTransactionThrows();
          }
          throw error;
        });
      });
  }

  // FeeRelayerRelayExtensions

  getRelayAccountCreationCost(): u64 {
    return this.cache.lamportsPerSignature ?? ZERO; // TODO: Check again
  }

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
    if (!pools.length || pools.length > 2) {
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
        transferAuthorityPubkey: newTransferAuthority
          ? transferAuthority.publicKey
          : this.owner.publicKey,
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
          transferAuthorityPubkey: newTransferAuthority
            ? transferAuthority.publicKey
            : this.owner.publicKey,
          amountIn: firstPoolAmountIn,
          minAmountOut: secondPoolAmountIn,
        }),
        to: getSwapData({
          pool: secondPool,
          transferAuthorityPubkey: newTransferAuthority
            ? transferAuthority.publicKey
            : this.owner.publicKey,
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

  getTransitTokenMintPubkey(pools: OrcaSwap.PoolsPair): PublicKey | null {
    let transitTokenMintPubkey: PublicKey | null = null;
    if (pools.length === 2) {
      const interTokenName = pools[0]!.tokenBName.toString();
      const mint = this.orcaSwapClient.getMint(interTokenName);
      transitTokenMintPubkey = mint ? new PublicKey(mint) : null;
    }
    return transitTokenMintPubkey;
  }

  getTransitToken(pools: OrcaSwap.PoolsPair): TokenInfo | null {
    const transitTokenMintPubkey = this.getTransitTokenMintPubkey(pools);

    let transitTokenAccountAddress: PublicKey | null = null;
    if (transitTokenMintPubkey) {
      transitTokenAccountAddress = FeeRelayerRelayProgram.getTransitTokenAccountAddress({
        user: this.owner.publicKey,
        transitTokenMint: transitTokenMintPubkey,
        network: this.solanaClient.endpoint.network,
      });
    }

    if (transitTokenMintPubkey && transitTokenAccountAddress) {
      return new TokenInfo({
        address: transitTokenAccountAddress.toString(),
        mint: transitTokenMintPubkey.toString(),
      });
    }
    return null;
  }

  checkIfNeedsCreateTransitTokenAccount(transitToken: TokenInfo | null): Promise<boolean | null> {
    if (!transitToken) {
      return Promise.resolve(null);
    }

    return this.solanaClient
      .getAccountInfo({
        account: transitToken.address,
        decodedTo: SolanaSDK.AccountInfo,
      })
      .then((info) => {
        // detect if destination address is already a SPLToken address
        if (info.data.mint.toString() === transitToken.mint) {
          return false;
        }
        return true;
      })
      .catch(() => true);
  }

  /// Update free transaction fee limit
  updateFreeTransactionFeeLimit(): Promise<void> {
    return this.apiClient.requestFreeFeeLimits(this.owner.publicKey.toString()).then((info) => {
      const infoNew = new FreeTransactionFeeLimit({
        maxUsage: info.limits.maxCount,
        currentUsage: info.processedFee.count,
        maxAmount: info.limits.maxAmount,
        amountUsed: info.processedFee.totalAmount,
      });

      this.cache.freeTransactionFeeLimit = infoNew;
    });
  }

  updateRelayAccountStatus(): Promise<void> {
    return this.solanaClient
      .getRelayAccountStatus(this.userRelayAddress.toString())
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
    sourceToken: TokenInfo;
    destinationTokenMint: string;
    destinationAddress?: string;
    payingFeeToken?: TokenInfo;
    swapPools: OrcaSwap.PoolsPair;
    inputAmount: u64;
    slippage: number;
  }): Promise<{
    transactions: SolanaSDK.PreparedTransaction[];
    additionalPaybackFee: u64;
  }> {
    const transitToken = this.getTransitToken(swapPools);
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
      this._getFixedDestination({
        destinationTokenMint,
        destinationAddress,
      }),
      this.solanaClient.getRecentBlockhash(),
      this.checkIfNeedsCreateTransitTokenAccount(transitToken),
    ]).then(([preparedParams, destination, recentBlockhash, needsCreateTransitTokenAccount]) => {
      // get needed info
      const minimumTokenAccountBalance = this.cache.minimumTokenAccountBalance;
      const feePayerAddress = this.cache.feePayerAddress;
      const lamportsPerSignature = this.cache.lamportsPerSignature;
      if (!minimumTokenAccountBalance || !feePayerAddress || !lamportsPerSignature) {
        throw FeeRelayerError.relayInfoMissing();
      }

      const destinationToken = destination.destinationToken;
      // const userDestinationAccountOwnerAddress = destination.userDestinationAccountOwnerAddress;
      const needsCreateDestinationTokenAccount = destination.needsCreateDestinationTokenAccount;

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
    sourceTokenMint: string;
    destinationTokenMint: string;
    destinationAddress?: string;
  }): Promise<SolanaSDK.FeeAmount> {
    return this._getFixedDestination({
      destinationTokenMint,
      destinationAddress,
    }).then((destination) => {
      const lamportsPerSignature = this.cache.lamportsPerSignature;
      const minimumTokenAccountBalance = this.cache.minimumTokenAccountBalance;

      if (!lamportsPerSignature || !minimumTokenAccountBalance) {
        throw FeeRelayerError.relayInfoMissing();
      }

      const needsCreateDestinationTokenAccount = destination.needsCreateDestinationTokenAccount;

      const expectedFee = SolanaSDK.FeeAmount.zero();

      // fee for payer's signature
      expectedFee.transaction = expectedFee.transaction.add(lamportsPerSignature);

      // fee for owner's signature
      expectedFee.transaction = expectedFee.transaction.add(lamportsPerSignature);

      // when source token is native SOL
      if (sourceTokenMint === SolanaSDKPublicKey.wrappedSOLMint.toString()) {
        // WSOL's signature
        expectedFee.transaction = expectedFee.transaction.add(lamportsPerSignature);
      }

      // when needed to create destination
      if (
        needsCreateDestinationTokenAccount &&
        destinationTokenMint !== SolanaSDKPublicKey.wrappedSOLMint.toString()
      ) {
        expectedFee.accountBalances = expectedFee.accountBalances.add(minimumTokenAccountBalance);
      }

      // when destination is native SOL
      if (destinationTokenMint === SolanaSDKPublicKey.wrappedSOLMint.toString()) {
        expectedFee.transaction = expectedFee.transaction.add(lamportsPerSignature);
      }

      // in transitive swap, there will be situation when swapping from SOL -> SPL that needs spliting transaction to 2 transactions
      if (
        swapPools?.length === 2 &&
        sourceTokenMint === SolanaSDKPublicKey.wrappedSOLMint.toString() &&
        destinationAddress === null
      ) {
        expectedFee.transaction = expectedFee.transaction.add(lamportsPerSignature.muln(2));
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
    sourceToken: TokenInfo;
    destinationToken: TokenInfo;
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
    const userAuthorityAddress = this.owner.publicKey;
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
    if (sourceToken.mint === SolanaSDKPublicKey.wrappedSOLMint.toString()) {
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
      additionalPaybackFee = additionalPaybackFee.add(minimumTokenAccountBalance);
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
        userDestinationTokenAccountAddress = destinationNewAccount.publicKey.toString();
        accountCreationFee = accountCreationFee.add(minimumTokenAccountBalance);
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
            instructions: [instruction],
            signers: [this.owner],
            blockhash,
            feePayerAddress: feePayerAddressNew,
            accountCreationFee: minimumTokenAccountBalance,
          });
        } else {
          instructions.push(instruction);
          accountCreationFee = accountCreationFee.add(minimumTokenAccountBalance);
        }
        userDestinationTokenAccountAddress = associatedAddress.toString();
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
      accountCreationFee = accountCreationFee.sub(minimumTokenAccountBalance);
    }

    // resign transaction
    const signers = [this.owner];
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
    instructions,
    signers,
    blockhash,
    feePayerAddress,
    accountCreationFee,
  }: {
    instructions: TransactionInstruction[];
    signers: Account[];
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
    sourceToken: TokenInfo;
    destinationTokenMint: string;
    destinationAddress?: string;
    payingFeeToken?: TokenInfo;
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
          fromMint: payingFeeToken.mint,
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

          if (payingFeeToken?.mint === SolanaSDKPublicKey.wrappedSOLMint.toString()) {
            topUpPreparedParam = null;
          } else {
            const relayAccountBalance = relayAccountStatus.balance;
            if (relayAccountBalance && relayAccountBalance.gte(swappingFee.total)) {
              topUpPreparedParam = null;
            }
            // STEP 2.2: Else
            else {
              // Get best poolpairs for topping up
              const targetAmount = swappingFee.total.sub(relayAccountStatus.balance ?? ZERO);

              // Get real amounts needed for topping up
              const amounts = this.calculateTopUpAmount({
                targetAmount,
                relayAccountStatus,
                freeTransactionFeeLimit,
              });
              const topUpAmount = amounts.topUpAmount;
              const expectedFee = amounts.expectedFee;

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

  /// Get fixed destination
  private _getFixedDestination({
    destinationTokenMint,
    destinationAddress,
  }: {
    destinationTokenMint: string;
    destinationAddress?: string;
  }): Promise<{
    destinationToken: TokenInfo;
    userDestinationAccountOwnerAddress: PublicKey | null;
    needsCreateDestinationTokenAccount: boolean;
  }> {
    // Redefine destination
    let userDestinationAccountOwnerAddress: PublicKey | null;
    let destinationRequest: Promise<SolanaSDK.SPLTokenDestinationAddress>;

    if (SolanaSDKPublicKey.wrappedSOLMint.toString() === destinationTokenMint) {
      // Swap to native SOL account
      userDestinationAccountOwnerAddress = this.owner.publicKey;
      destinationRequest = Promise.resolve(
        new SolanaSDK.SPLTokenDestinationAddress({
          destination: this.owner.publicKey,
          isUnregisteredAsocciatedToken: true,
        }),
      );
    } else {
      // Swap to other SPL
      userDestinationAccountOwnerAddress = null;

      if (destinationAddress) {
        const destinationAddressNew: PublicKey = new PublicKey(destinationAddress);
        destinationRequest = Promise.resolve(
          new SolanaSDK.SPLTokenDestinationAddress({
            destination: destinationAddressNew,
            isUnregisteredAsocciatedToken: false,
          }),
        );
      } else {
        destinationRequest = this.solanaClient.findSPLTokenDestinationAddress({
          mintAddress: destinationTokenMint,
          destinationAddress: this.owner.publicKey.toString(),
        });
      }
    }

    return destinationRequest.then(({ destination, isUnregisteredAsocciatedToken }) => {
      return {
        destinationToken: new TokenInfo({
          address: destination.toString(),
          mint: destinationTokenMint,
        }),
        userDestinationAccountOwnerAddress,
        needsCreateDestinationTokenAccount: isUnregisteredAsocciatedToken,
      };
    });
  }

  // FeeRelayerRelayNativeSwap
  calculateNeededTopUpAmountNative({
    swapTransactions,
    payingTokenMint,
  }: {
    swapTransactions: OrcaSwap.PreparedSwapTransaction[];
    payingTokenMint?: string;
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
    payingFeeToken?: TokenInfo;
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
          feePayer: feePayer ?? this.owner.publicKey,
          payingFeeToken,
        });

        if (swapTransactions.length === 2) {
          return request.then(() => {
            return promiseRetry(
              (_retry) => {
                return this._prepareAndSend({
                  swapTransaction: swapTransactions[1]!,
                  feePayer: feePayer ?? this.owner.publicKey,
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
    payingFeeToken?: TokenInfo;
  }): Promise<string[]> {
    return this.solanaClient
      .prepareTransaction({
        instructions: swapTransaction.instructions,
        signers: swapTransaction.signers,
        feePayer,
        accountsCreationFee: swapTransaction.accountCreationFee,
        recentBlockhash: null,
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

  topUp({
    needsCreateUserRelayAddress,
    sourceToken,
    targetAmount,
    topUpPools,
    expectedFee,
  }: {
    needsCreateUserRelayAddress: boolean;
    sourceToken: TokenInfo;
    targetAmount: u64;
    topUpPools: OrcaSwap.PoolsPair;
    expectedFee: u64;
  }): Promise<string[]> {
    const transitToken = this.getTransitToken(topUpPools);
    return Promise.all([
      this.solanaClient.getRecentBlockhash(),
      this.updateFreeTransactionFeeLimit(),
      this.checkIfNeedsCreateTransitTokenAccount(transitToken),
    ]).then(async ([recentBlockhash, _, needsCreateTransitTokenAccount]) => {
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
        userAuthorityAddress: this.owner.publicKey,
        userRelayAddress: this.userRelayAddress,
        topUpPools,
        targetAmount,
        expectedFee,
        blockhash: recentBlockhash,
        minimumRelayAccountBalance,
        minimumTokenAccountBalance,
        needsCreateUserRelayAccount: needsCreateUserRelayAddress,
        feePayerAddress,
        // lamportsPerSignature,
        // freeTransactionFeeLimit,
        needsCreateTransitTokenAccount,
        transitTokenMintPubkey: transitToken?.mint ? new PublicKey(transitToken.mint) : null,
        transitTokenAccountAddress: transitToken?.address
          ? new PublicKey(transitToken.address)
          : null,
      });

      // STEP 4: send transaction
      const signatures = topUpTransaction.preparedTransaction.transaction.signatures;
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

      // TODO: retry
      return this.apiClient
        .sendTransaction(
          FeeRelayerRequestType.relayTopUpWithSwap(
            new TopUpWithSwapParams({
              userSourceTokenAccountPubkey: sourceToken.address,
              sourceTokenMintPubkey: sourceToken.mint,
              userAuthorityPubkey: this.owner.publicKey.toString(),
              topUpSwap: new SwapData(topUpTransaction.swapData),
              feeAmount: expectedFee,
              signatures: topUpSignatures,
              blockhash: recentBlockhash,
            }),
          ),
        )
        .then((txId) => {
          return [txId];
        })
        .finally(() => {
          Logger.log(
            `Top up ${targetAmount.toString()} into ${this.userRelayAddress.toString()} completed`,
            LogEvent.info,
          );

          this.markTransactionAsCompleted(lamportsPerSignature.muln(2));
        });
    });
  }

  // FeeRelayerRelayTopUp Helpers
  prepareForTopUpCheck({
    targetAmount,
    payingFeeToken,
    relayAccountStatus,
    freeTransactionFeeLimit,
    checkIfBalanceHaveEnoughAmount = true,
    forceUsingTransitiveSwap = false, // true for testing purpose only
  }: {
    targetAmount: SolanaSDK.Lamports;
    payingFeeToken: TokenInfo;
    relayAccountStatus: RelayAccountStatus;
    freeTransactionFeeLimit?: FreeTransactionFeeLimit;
    checkIfBalanceHaveEnoughAmount?: boolean;
    forceUsingTransitiveSwap?: boolean;
  }): Promise<TopUpPreparedParams | null> {
    // form request
    return this.orcaSwapClient
      .getTradablePoolsPairs({
        fromMint: payingFeeToken.mint,
        toMint: SolanaSDKPublicKey.wrappedSOLMint.toString(),
      })
      .then((tradableTopUpPoolsPair) => {
        // TOP UP
        const relayAccountBalance = relayAccountStatus.balance;
        if (checkIfBalanceHaveEnoughAmount && relayAccountBalance?.gte(targetAmount)) {
          return null;
        }
        // STEP 2.2: Else
        else {
          // Get target amount for topping up
          let targetAmountNew = targetAmount;
          if (checkIfBalanceHaveEnoughAmount) {
            targetAmountNew = targetAmount.sub(relayAccountBalance ?? ZERO);
          }

          // Get real amounts needed for topping up
          const amounts = this.calculateTopUpAmount({
            targetAmount: targetAmountNew,
            relayAccountStatus,
            freeTransactionFeeLimit,
          });
          const topUpAmount = amounts.topUpAmount;
          const expectedFee = amounts.expectedFee;

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
      });
  }

  calculateTopUpAmount({
    targetAmount,
    relayAccountStatus,
    freeTransactionFeeLimit,
  }: {
    targetAmount: u64;
    relayAccountStatus: RelayAccountStatus;
    freeTransactionFeeLimit?: FreeTransactionFeeLimit;
  }): {
    topUpAmount: u64;
    expectedFee: u64;
  } {
    // get cache
    const minimumRelayAccountBalance = this.cache.minimumRelayAccountBalance;
    const lamportsPerSignature = this.cache.lamportsPerSignature;
    const minimumTokenAccountBalance = this.cache.minimumTokenAccountBalance;
    if (!minimumRelayAccountBalance || !lamportsPerSignature || !minimumTokenAccountBalance) {
      throw FeeRelayerError.relayInfoMissing();
    }

    // current_fee
    let currentFee: u64 = ZERO;
    if (relayAccountStatus.type === RelayAccountStatusType.notYetCreated) {
      currentFee = currentFee.add(minimumRelayAccountBalance);
    }

    const transactionNetworkFee = new u64(2).mul(lamportsPerSignature); // feePayer, owner
    if (
      !freeTransactionFeeLimit?.isFreeTransactionFeeAvailable({
        transactionFee: transactionNetworkFee,
      })
    ) {
      currentFee = currentFee.add(transactionNetworkFee);
    }

    // swap_amount_out
    // let swapAmountOut = targetAmount.add(currentFee)
    let swapAmountOut = targetAmount;
    if (relayAccountStatus.type === RelayAccountStatusType.notYetCreated) {
      swapAmountOut = swapAmountOut.add(this.getRelayAccountCreationCost()); // Temporary solution
    } else {
      swapAmountOut = swapAmountOut.add(currentFee);
    }

    // expected_fee
    const expectedFee = currentFee.add(minimumTokenAccountBalance);

    return { topUpAmount: swapAmountOut, expectedFee };
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
    sourceToken: TokenInfo;
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
    const userSourceTokenAccountAddress = sourceToken.address
      ? new PublicKey(sourceToken.address)
      : null;
    const sourceTokenMintAddress = sourceToken.mint ? new PublicKey(sourceToken.mint) : null;
    const feePayerAddressNew = feePayerAddress ? new PublicKey(feePayerAddress) : null;
    if (!userSourceTokenAccountAddress || !sourceTokenMintAddress || !feePayerAddressNew) {
      throw FeeRelayerError.wrongAddress();
    }
    const associatedTokenAddress = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      sourceTokenMintAddress,
      feePayerAddressNew,
    );
    if (!userSourceTokenAccountAddress.equals(associatedTokenAddress)) {
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
      accountCreationFee = accountCreationFee.add(minimumRelayAccountBalance);
    }

    // top up swap
    const swap = this.prepareSwapData({
      pools: topUpPools,
      inputAmount: null,
      minAmountOut: targetAmount,
      slippage: 0.01,
      transitTokenMintPubkey,
      needsCreateTransitTokenAccount: needsCreateTransitTokenAccount === true,
    });
    const userTransferAuthority = swap.transferAuthorityAccount?.publicKey;

    const swapNew = swap.swapData;
    switch (swapNew.constructor) {
      case DirectSwapData: {
        accountCreationFee = accountCreationFee.add(minimumTokenAccountBalance);
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
        accountCreationFee = accountCreationFee.add(minimumTokenAccountBalance);

        // top up
        instructions.push(
          FeeRelayerRelayProgram.topUpSwapInstruction({
            network,
            topUpSwap: swap,
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
    const signers = [this.owner];
    const tranferAuthority = swap.transferAuthorityAccount;
    if (tranferAuthority) {
      signers.push(tranferAuthority);
    }
    transaction.sign(...signers);

    const decodedTransaction = JSON.stringify(transaction);
    Logger.log(decodedTransaction, LogEvent.info);

    return {
      swapData: swap.swapData,
      preparedTransaction: new SolanaSDK.PreparedTransaction({
        transaction,
        signers,
        expectedFee: expectedFeeNew,
      }),
    };
  }

  // Helpers

  checkAndTopUp({
    expectedFee,
    payingFeeToken,
  }: {
    expectedFee: SolanaSDK.FeeAmount;
    payingFeeToken?: TokenInfo | null;
  }): Promise<string[] | null> {
    // if paying fee token is solana, skip the top up
    if (payingFeeToken?.mint === SolanaSDKPublicKey.wrappedSOLMint.toString()) {
      return Promise.resolve(null);
    }

    const freeTransactionFeeLimit = this.cache.freeTransactionFeeLimit;
    const relayAccountStatus = this.cache.relayAccountStatus;
    if (!freeTransactionFeeLimit || !relayAccountStatus) {
      throw FeeRelayerError.relayInfoMissing();
    }

    // Check fee
    if (
      freeTransactionFeeLimit.isFreeTransactionFeeAvailable({
        transactionFee: expectedFee.transaction,
      })
    ) {
      expectedFee.transaction = ZERO;
    }

    let request: Promise<TopUpPreparedParams | null>;

    // if payingFeeToken is provided
    if (payingFeeToken && expectedFee.total.gtn(0)) {
      request = this.prepareForTopUpCheck({
        targetAmount: expectedFee.total,
        payingFeeToken,
        relayAccountStatus,
        freeTransactionFeeLimit,
      });
    }
    // if not, make sure that relayAccountBalance is greater or equal to expected fee
    else {
      request = Promise.reject(FeeRelayerError.feePayingTokenMissing());
    }

    return request.then((topUpParams) => {
      if (topUpParams && payingFeeToken) {
        return this.topUp({
          needsCreateUserRelayAddress:
            relayAccountStatus.type === RelayAccountStatusType.notYetCreated,
          sourceToken: payingFeeToken,
          targetAmount: topUpParams.amount,
          topUpPools: topUpParams.poolsPair,
          expectedFee: topUpParams.expectedFee,
        });
      }

      return null;
    });
  }

  relayTransaction({
    preparedTransaction,
    payingFeeToken,
    relayAccountStatus,
    additionalPaybackFee,
    operationType,
    currency,
  }: {
    preparedTransaction: SolanaSDK.PreparedTransaction;
    payingFeeToken?: TokenInfo | null;
    relayAccountStatus: RelayAccountStatus;
    additionalPaybackFee: u64;
    operationType: StatsInfoOperationType;
    currency: string | null;
  }): Promise<string[]> {
    const feePayer = this.cache.feePayerAddress;
    const freeTransactionFeeLimit = this.cache.freeTransactionFeeLimit;
    if (!feePayer || !freeTransactionFeeLimit) {
      throw FeeRelayerError.unauthorized();
    }

    // verify fee payer
    if (feePayer !== preparedTransaction.transaction.feePayer?.toString()) {
      throw FeeRelayerError.invalidFeePayer();
    }

    // Calculate the fee to send back to feePayer
    // Account creation fee (accountBalances) is a must-pay-back fee
    let paybackFee = additionalPaybackFee.add(preparedTransaction.expectedFee.accountBalances);

    // The transaction fee, on the other hand, is only be paid if user used more than number of free transaction fee
    if (
      !freeTransactionFeeLimit.isFreeTransactionFeeAvailable({
        transactionFee: preparedTransaction.expectedFee.transaction,
      })
    ) {
      paybackFee = paybackFee.add(preparedTransaction.expectedFee.transaction);
    }

    // transfer sol back to feerelayer's feePayer
    // TODO: check references
    const preparedTransactionNew = preparedTransaction;
    if (paybackFee.gtn(0)) {
      if (
        payingFeeToken?.mint === SolanaSDKPublicKey.wrappedSOLMint.toString() &&
        (relayAccountStatus.balance ?? ZERO).lt(paybackFee)
      ) {
        preparedTransactionNew.transaction.instructions.push(
          SystemProgram.transfer({
            fromPubkey: this.owner.publicKey,
            toPubkey: new PublicKey(feePayer),
            lamports: paybackFee.toNumber(),
          }),
        );
      } else {
        preparedTransactionNew.transaction.instructions.push(
          FeeRelayerRelayProgram.transferSolInstruction({
            userAuthorityAddress: this.owner.publicKey,
            recipient: new PublicKey(feePayer),
            lamports: paybackFee,
            network: this.solanaClient.endpoint.network,
          }),
        );
      }
    }

    // if (debug) {
    const decodedTransaction = JSON.stringify(preparedTransactionNew.transaction);
    Logger.log(decodedTransaction, LogEvent.info);
    // }

    // resign transaction
    console.log(111, preparedTransactionNew.signers);
    if (preparedTransactionNew.signers.length > 0) {
      preparedTransactionNew.transaction.sign(...preparedTransactionNew.signers);
    }

    // TODO: retry
    return this.apiClient
      .sendTransaction(
        FeeRelayerRequestType.relayTransaction(
          new RelayTransactionParam(
            preparedTransactionNew,
            new StatsInfo({
              operationType,
              deviceType: this.deviceType,
              currency,
              build: this.buildNumber,
            }),
          ),
        ),
      )
      .then((txId) => {
        return [txId];
      })
      .finally(() => {
        this.markTransactionAsCompleted(
          preparedTransactionNew.expectedFee.total.add(additionalPaybackFee).sub(paybackFee),
        );
      });
  }
}
