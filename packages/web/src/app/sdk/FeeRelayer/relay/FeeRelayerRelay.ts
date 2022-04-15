/* eslint-disable @typescript-eslint/no-magic-numbers */

import { ZERO } from '@orca-so/sdk';
import type { Network } from '@saberhq/solana-contrib';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID, u64 } from '@solana/spl-token';
import type { TransactionInstruction } from '@solana/web3.js';
import { Account, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';

import type { FeeRelayerAPIClientType } from 'app/sdk/FeeRelayer/apiClient/FeeRelayerAPIClient';
import { FeeRelayerError } from 'app/sdk/FeeRelayer/models/FeeRelayerError';
import { getSwapData } from 'app/sdk/FeeRelayer/relay/helpers/FeeRelayerRelayExtensions';
import { FeeRelayerRelayProgram } from 'app/sdk/FeeRelayer/relay/RelayProgram/FeeRelayerRelayProgram';
import type * as OrcaSwap from 'app/sdk/OrcaSwap';
import { getInputAmountSlippage } from 'app/sdk/OrcaSwap';
import type { SolanaSDKAccountStorage } from 'app/sdk/SolanaSDK';
import * as SolanaSDK from 'app/sdk/SolanaSDK';
import { SolanaSDKPublicKey } from 'app/sdk/SolanaSDK';

import type { FeeRelayerRelaySwapType, RelayAccountStatus } from './helpers';
import {
  Cache,
  DirectSwapData,
  FreeTransactionFeeLimit,
  RelayAccountStatusType,
  TokenInfo,
  TopUpPreparedParams,
  TransitiveSwapData,
} from './helpers';
import type { FeeRelayerRelaySolanaClient } from './helpers/FeeRelayerRelaySolanaClient';

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

type FeeRelayerRelayType = {
  /// Expose current variable
  cache: Cache;

  /// Load all needed info for relay operations, need to be completed before any operation
  load(): void;

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
  }: {
    preparedTransaction: SolanaSDK.PreparedTransaction;
    payingFeeToken?: TokenInfo;
    additionalPaybackFee: u64;
  }): Promise<string[]>;

  /// Top up relay account (if needed) and relay mutiple transactions
  topUpAndRelayTransactions({
    preparedTransactions,
    payingFeeToken,
    additionalPaybackFee,
  }: {
    preparedTransactions: SolanaSDK.PreparedTransaction[];
    payingFeeToken?: TokenInfo;
    additionalPaybackFee: u64;
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
  calculateSwappingNetworkFees({}: {
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
};

export class FeeRelayerRelay implements FeeRelayerRelayType {
  // Dependencies
  apiClient: FeeRelayerAPIClientType;
  solanaClient: FeeRelayerRelaySolanaClient;
  accountStorage: SolanaSDKAccountStorage;
  orcaSwapClient: OrcaSwap.OrcaSwapType;

  // Properties
  cache: Cache;
  owner: Account;
  userRelayAddress: PublicKey;

  constructor({
    owner,
    apiClient,
    solanaClient,
    accountStorage,
    orcaSwapClient,
  }: {
    owner: Account;
    apiClient: FeeRelayerAPIClientType;
    solanaClient: FeeRelayerRelaySolanaClient;
    accountStorage: SolanaSDKAccountStorage;
    orcaSwapClient: OrcaSwap.OrcaSwapType;
  }) {
    // const owner = accountStorage.account;
    // if (!owner) {
    //   throw FeeRelayerError.unauthorized();
    // }

    this.apiClient = apiClient;
    this.solanaClient = solanaClient;
    this.accountStorage = accountStorage;
    this.orcaSwapClient = orcaSwapClient;
    this.owner = owner;
    this.userRelayAddress = FeeRelayerRelayProgram.getUserRelayAddress({
      user: this.owner.publicKey,
      network: this.solanaClient.endpoint.network,
    });
    this.cache = new Cache();
  }

  // Methods

  /// Load all needed info for relay operations, need to be completed before any operation
  load() {
    return Promise.all([
      // get minimum token account balance
      this.solanaClient.getMinimumBalanceForRentExemption(165),
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

  /// Calculate needed top up amount for expected fee
  calculateNeededTopUpAmount({
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
            payingTokenMint === SolanaSDKPublicKey.wrappedSOLMint().toString()
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
    return this.orcaSwapClient
      .getTradablePoolsPairs({
        fromMint: payingFeeTokenMint,
        toMint: SolanaSDKPublicKey.wrappedSOLMint().toString(),
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
  }: {
    preparedTransaction: SolanaSDK.PreparedTransaction;
    payingFeeToken?: TokenInfo;
    additionalPaybackFee: u64;
  }): Promise<string[]> {
    return this.topUpAndRelayTransactions({
      preparedTransactions: [preparedTransaction],
      payingFeeToken,
      additionalPaybackFee,
    });
  }

  topUpAndRelayTransactions({
    preparedTransactions,
    payingFeeToken,
    additionalPaybackFee,
  }: {
    preparedTransactions: SolanaSDK.PreparedTransaction[];
    payingFeeToken?: TokenInfo;
    additionalPaybackFee: u64;
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
      .then(() => {
        // assertion
        if (!preparedTransactions.length) {
          throw FeeRelayerError.unknown();
        }

        const request: Promise<string[]> = this.relayTransaction();
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
    ]).then(([recentBlockhash, _, needsCreateTransitTokenAccount]) => {
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
      const topUpTransaction = this.prepareForTopUp({
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
        lamportsPerSignature,
        freeTransactionFeeLimit,
        needsCreateTransitTokenAccount,
        transitTokenMintPubkey: transitToken?.mint ? new PublicKey(transitToken.mint) : null,
        transitTokenAccountAddress: transitToken?.address
          ? new PublicKey(transitToken.address)
          : null,
      });

      // STEP 4: send transaction

      return ['s'];
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
        toMint: SolanaSDKPublicKey.wrappedSOLMint().toString(),
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
    lamportsPerSignature,
    freeTransactionFeeLimit,
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
    lamportsPerSignature: u64;
    freeTransactionFeeLimit?: FreeTransactionFeeLimit;
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
              SolanaSDKPublicKey.tokenProgramId(),
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
              SolanaSDKPublicKey.tokenProgramId(),
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
    console.info(decodedTransaction);

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
    payingFeeToken?: TokenInfo;
  }): Promise<string[] | null> {
    // if paying fee token is solana, skip the top up
    if (payingFeeToken?.mint === SolanaSDKPublicKey.wrappedSOLMint().toString()) {
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

    const request: Promise<TopUpPreparedParams | null>;

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
        return this.topUp();
      }
    });
  }
}
