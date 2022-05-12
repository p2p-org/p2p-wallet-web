/* eslint-disable no-console */
import { ZERO } from '@orca-so/sdk';
import { u64 } from '@saberhq/token-utils';
import type { Signer, TransactionInstruction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import promiseRetry from 'promise-retry';
import { pickBy } from 'ramda';

import { toLamport } from 'new/app/sdk/SolanaSDK/extensions/NumberExtensions';
import { SolanaSDKPublicKey } from 'new/app/sdk/SolanaSDK/extensions/PublicKey/PublicKeyExtensions';

import type { AccountInstructions, Lamports } from '../SolanaSDK';
import { LogEvent, Logger, SwapResponse } from '../SolanaSDK';
import * as SolanaSDK from '../SolanaSDK';
import type { OrcaSwapAPIClient } from './apiClient/OrcaSwapAPIClient';
import type { OrcaSwapSolanaClient } from './apiClient/OrcaSwapSolanaClient';
import { OrcaSwapError } from './models/OrcaSwapError';
import { OrcaSwapInfo } from './models/OrcaSwapInfo';
import type { OrcaSwapPool } from './models/OrcaSwapPool';
import type { Pools, PoolsPair } from './models/OrcaSwapPools';
import {
  calculateLiquidityProviderFees,
  constructExchange,
  getInputAmount,
  getIntermediaryToken,
  getOutputAmount,
  getPools,
} from './models/OrcaSwapPools';
import { PreparedSwapTransaction } from './models/OrcaSwapPreparedSwapTransaction';
import type { OrcaSwapRoute, OrcaSwapRoutes } from './models/OrcaSwapRoute';
import type { OrcaSwapToken, OrcaSwapTokens } from './models/OrcaSwapToken';

export type OrcaSwapType = {
  load(): Promise<void>;
  getMint(tokenName: string): string | undefined;
  findPosibleDestinationMints(fromMint: string): string[];
  getTradablePoolsPairs({
    fromMint,
    toMint,
  }: {
    fromMint: string;
    toMint: string;
  }): Promise<PoolsPair[]>;
  findBestPoolsPairForInputAmount({
    inputAmount,
    poolsPairs,
  }: {
    inputAmount: u64;
    poolsPairs: PoolsPair[];
  }): PoolsPair | null;
  findBestPoolsPairForEstimatedAmount({
    estimatedAmount,
    poolsPairs,
  }: {
    estimatedAmount: u64;
    poolsPairs: PoolsPair[];
  }): PoolsPair | null;
  getLiquidityProviderFee({
    bestPoolsPair,
    inputAmount,
    slippage,
  }: {
    bestPoolsPair?: PoolsPair;
    inputAmount?: number;
    slippage: number;
  }): u64[];
  getNetworkFees({
    owner,
    myWalletsMints,
    fromWalletPubkey,
    toWalletPubkey,
    bestPoolsPair,
    inputAmount,
    slippage,
    lamportsPerSignature,
    minRentExempt,
  }: {
    owner: PublicKey;
    myWalletsMints: string[];
    fromWalletPubkey: string;
    toWalletPubkey?: string;
    bestPoolsPair?: PoolsPair;
    inputAmount?: number;
    slippage: number;
    lamportsPerSignature: u64;
    minRentExempt: u64;
  }): Promise<SolanaSDK.FeeAmount>;
  prepareForSwapping({
    owner,
    fromWalletPubkey,
    toWalletPubkey,
    bestPoolsPair,
    amount,
    feePayer,
    slippage,
  }: {
    owner: Signer;
    fromWalletPubkey: string;
    toWalletPubkey?: string;
    bestPoolsPair: PoolsPair;
    amount: number;
    feePayer?: PublicKey | null; // null if the owner is the fee payer
    slippage: number;
  }): Promise<[PreparedSwapTransaction[], string | null]>;
  swap({
    owner,
    fromWalletPubkey,
    toWalletPubkey,
    bestPoolsPair,
    amount,
    slippage,
    isSimulation,
  }: {
    owner: Signer;
    fromWalletPubkey: string;
    toWalletPubkey?: string;
    bestPoolsPair: PoolsPair;
    amount: number;
    slippage: number;
    isSimulation: boolean;
  }): Promise<SolanaSDK.SwapResponse>;
};

export class OrcaSwap implements OrcaSwapType {
  // Properties
  protected _apiClient: OrcaSwapAPIClient;
  protected _solanaClient: OrcaSwapSolanaClient;

  private _info: OrcaSwapInfo | null = null;

  // Constructor
  constructor(apiClient: OrcaSwapAPIClient, solanaClient: OrcaSwapSolanaClient) {
    this._apiClient = apiClient;
    this._solanaClient = solanaClient;
  }

  // Methods
  /// Prepare all needed infos for swapping
  load(): Promise<void> {
    if (this._info) {
      return Promise.resolve();
    }

    const tokens = this._apiClient.getTokens();
    const pools = this._apiClient.getPools();
    const programIds = this._apiClient.getProgramID();

    const routes = _findAllAvailableRoutes(tokens, pools);
    const tokenNames: Record<string, string> = {};
    Object.entries(tokens).forEach(([key, value]) => {
      tokenNames[value.mint] = key;
    });

    Logger.log('Orca swap info loaded', LogEvent.debug);

    this._info = new OrcaSwapInfo({ routes, tokens, pools, programIds, tokenNames });

    return Promise.resolve();
  }

  /// Get token's mint address by its name
  getMint(tokenName: string): string | undefined {
    const info = this._info;
    if (!info?.tokenNames) {
      return;
    }

    return Object.entries(info?.tokenNames).find((obj) => obj[1] === tokenName)?.[0];
  }

  /// Map mint to token info
  private _getTokenFromMint(mint?: string): { name: string; info: OrcaSwapToken } | null {
    const info = this._info;
    if (!info) {
      return null;
    }

    const key = Object.entries(info.tokens).filter(([, token]) => token.mint === mint)?.[0]?.[0];
    if (!key) {
      return null;
    }

    const tokenInfo = info.tokens[key];
    if (!tokenInfo) {
      return null;
    }

    return { name: key, info: tokenInfo };
  }

  /// Find posible destination tokens by mint
  /// - Parameter fromMint: from token mint
  /// - Returns: List of token mints that can be swapped to
  findPosibleDestinationMints(fromMint: string): string[] {
    const fromTokenName = this._getTokenFromMint(fromMint)?.name;
    if (!fromTokenName) {
      throw OrcaSwapError.notFound();
    }

    const routes = this._findRoutes(fromTokenName, null);
    const info = this._info;

    const mints = Array.from(
      Object.keys(routes).reduce((acc, key) => {
        const name = key.split('/').find((tokenName) => tokenName !== fromTokenName);
        if (name && info?.tokens[name]?.mint) {
          acc.add(info.tokens[name]!.mint);
        }

        return acc;
      }, new Set<string>()),
    );

    return mints;
  }

  /// Get all tradable pools pairs for current token pair
  /// - Returns: route and parsed pools
  async getTradablePoolsPairs({
    fromMint,
    toMint,
  }: {
    fromMint: string;
    toMint: string;
  }): Promise<PoolsPair[]> {
    const fromTokenName = this._getTokenFromMint(fromMint)?.name;
    const toTokenName = this._getTokenFromMint(toMint)?.name;
    const currentRoutes = Object.values(this._findRoutes(fromTokenName, toTokenName))[0];

    if (!fromTokenName || !toTokenName || !currentRoutes) {
      return [];
    }

    const requests = Promise.all(
      currentRoutes.map((route) => {
        // FIXME: Support more than 2 paths later
        if (route.length > 2) {
          return null;
        }

        if (!this._info?.pools) {
          return null;
        }

        return getPools({
          pools: this._info.pools,
          route,
          fromTokenName,
          toTokenName,
          solanaClient: this._solanaClient,
        });
      }),
    );

    return requests.then((resRequests) => resRequests.filter(Boolean) as PoolsPair[]);
  }

  /// Find best pool to swap from input amount
  findBestPoolsPairForInputAmount({
    inputAmount,
    poolsPairs,
  }: {
    inputAmount: u64;
    poolsPairs: PoolsPair[];
  }): PoolsPair | null {
    if (!poolsPairs.length) {
      return null;
    }

    let bestPools: OrcaSwapPool[] | null = null;
    let bestEstimatedAmount: u64 = ZERO;

    for (const pair of poolsPairs) {
      const estimatedAmount = getOutputAmount(pair, inputAmount);
      if (!estimatedAmount) {
        continue;
      }

      if (estimatedAmount > bestEstimatedAmount) {
        bestEstimatedAmount = estimatedAmount;
        bestPools = pair;
      }
    }

    return bestPools;
  }

  /// Find best pool to swap from estimated amount
  findBestPoolsPairForEstimatedAmount({
    estimatedAmount,
    poolsPairs,
  }: {
    estimatedAmount: u64;
    poolsPairs: PoolsPair[];
  }): PoolsPair | null {
    if (!poolsPairs.length) {
      return null;
    }

    let bestPools: OrcaSwapPool[] | null = null;
    let bestInputAmount: u64 = new u64(Number.MAX_SAFE_INTEGER);

    for (const pair of poolsPairs) {
      const inputAmount = getInputAmount(pair, estimatedAmount);
      if (!inputAmount) {
        continue;
      }

      if (inputAmount.lt(bestInputAmount)) {
        bestInputAmount = inputAmount;
        bestPools = pair;
      }
    }

    return bestPools;
  }

  /// Get liquidity provider fee
  getLiquidityProviderFee({
    bestPoolsPair,
    inputAmount,
    slippage,
  }: {
    bestPoolsPair?: PoolsPair;
    inputAmount?: number;
    slippage: number;
  }): u64[] {
    if (!bestPoolsPair) {
      return [];
    }

    return calculateLiquidityProviderFees(bestPoolsPair, inputAmount ?? 0, slippage) ?? [];
  }

  /// Get network fees from current context
  /// - Returns: transactions fees (fees for signatures), liquidity provider fees (fees in intermediary token?, fees in destination token)
  async getNetworkFees({
    owner,
    myWalletsMints,
    fromWalletPubkey,
    toWalletPubkey,
    bestPoolsPair,
    inputAmount,
    slippage,
    lamportsPerSignature,
    minRentExempt,
  }: {
    owner: PublicKey;
    myWalletsMints: string[];
    fromWalletPubkey: string;
    toWalletPubkey?: string;
    bestPoolsPair?: PoolsPair;
    inputAmount?: number;
    slippage: number;
    lamportsPerSignature: u64;
    minRentExempt: u64;
  }): Promise<SolanaSDK.FeeAmount> {
    let numberOfTransactions = new u64(1);

    if (bestPoolsPair?.length === 2) {
      const myTokens = myWalletsMints
        .map((mint) => this._getTokenFromMint(mint)?.name)
        .filter(Boolean) as string[];
      const intermediaryTokenName = bestPoolsPair[0]!.tokenBName.toString();

      if (!myTokens.includes(intermediaryTokenName) || toWalletPubkey === null) {
        numberOfTransactions = numberOfTransactions.addn(1);
      }
    }

    const expectedFee = SolanaSDK.FeeAmount.zero();

    // fee for owner's signature
    expectedFee.transaction = expectedFee.transaction.add(
      numberOfTransactions.mul(lamportsPerSignature),
    );

    // when source token is native SOL
    if (fromWalletPubkey === owner.toBase58()) {
      // WSOL's signature
      expectedFee.transaction = expectedFee.transaction.add(lamportsPerSignature);
      expectedFee.deposit = expectedFee.deposit.add(minRentExempt);
    }

    // when there is intermediary token
    let isIntermediaryTokenCreatedRequest = Promise.resolve(true);
    if (bestPoolsPair?.length === 2) {
      const decimals = bestPoolsPair[0]!.tokenABalance?.decimals;
      if (decimals && inputAmount) {
        const intermediaryToken = getIntermediaryToken(
          bestPoolsPair,
          toLamport(inputAmount, decimals),
          slippage,
        );
        if (intermediaryToken) {
          const mint = this.getMint(intermediaryToken.tokenName);
          if (mint) {
            // when intermediary token is SOL, a deposit fee for creating WSOL is needed (will be returned after transaction)
            if (intermediaryToken.tokenName === 'SOL') {
              expectedFee.transaction = expectedFee.transaction.add(lamportsPerSignature);
              expectedFee.deposit = expectedFee.deposit.add(minRentExempt);
            }
            // Check if intermediary token creation is needed
            else {
              isIntermediaryTokenCreatedRequest =
                this._solanaClient.checkIfAssociatedTokenAccountExists(owner, mint);
            }
          }
        }
      }
    }

    // when needed to create destination
    if (!toWalletPubkey) {
      expectedFee.accountBalances = expectedFee.accountBalances.add(minRentExempt);
    }

    return isIntermediaryTokenCreatedRequest.then((needsCreateIntermediaryToken) => {
      // Intermediary token needs to be created, so add the fee
      if (needsCreateIntermediaryToken) {
        expectedFee.accountBalances = expectedFee.accountBalances.add(minRentExempt);
      }

      return expectedFee;
    });
  }

  /// Execute swap
  prepareForSwapping({
    owner,
    fromWalletPubkey,
    toWalletPubkey,
    bestPoolsPair,
    amount,
    feePayer,
    slippage,
  }: {
    owner: Signer;
    fromWalletPubkey: string;
    toWalletPubkey?: string;
    bestPoolsPair: PoolsPair;
    amount: number;
    feePayer?: PublicKey | null; // nil if the owner is the fee payer
    slippage: number;
  }): Promise<[PreparedSwapTransaction[], string | null /*New created account*/]> {
    if (!bestPoolsPair.length) {
      throw OrcaSwapError.swapInfoMissing();
    }

    const fromDecimals = bestPoolsPair[0]!.tokenABalance?.decimals;
    if (!fromDecimals) {
      throw OrcaSwapError.invalidPool();
    }

    const amountNew = toLamport(amount, fromDecimals);

    const minRentExemptionRequest = this._solanaClient.getMinimumBalanceForRentExemption(165);

    if (bestPoolsPair.length === 1) {
      return minRentExemptionRequest
        .then((minRentExemption) => {
          return this._directSwap({
            owner,
            pool: bestPoolsPair[0]!,
            fromTokenPubkey: fromWalletPubkey,
            toTokenPubkey: toWalletPubkey,
            amount: amountNew,
            feePayer,
            slippage,
            minRentExemption,
          });
        })
        .then(([x, y]) => [[x], y]);
    } else {
      const pool0 = bestPoolsPair[0]!;
      const pool1 = bestPoolsPair[1]!;

      // TO AVOID `TRANSACTION IS TOO LARGE` ERROR, WE SPLIT OPERATION INTO 2 TRANSACTIONS
      // FIRST TRANSACTION IS TO CREATE ASSOCIATED TOKEN ADDRESS FOR INTERMEDIARY TOKEN OR DESTINATION TOKEN (IF NOT YET CREATED) AND WAIT FOR CONFIRMATION **IF THEY ARE NOT WSOL**
      // SECOND TRANSACTION TAKE THE RESULT OF FIRST TRANSACTION (ADDRESSES) TO REDUCE ITS SIZE. **IF INTERMEDIATE TOKEN OR DESTINATION TOKEN IS WSOL, IT SHOULD BE INCLUDED IN THIS TRANSACTION**

      // First transaction
      return minRentExemptionRequest.then((resMinRentExemption) => {
        const minRentExemption = new u64(resMinRentExemption);
        return this.createIntermediaryTokenAndDestinationTokenAddressIfNeeded({
          owner,
          pool0,
          pool1,
          // toWalletPubkey,
          feePayer,
          minRentExemption,
        }).then(
          ([
            intermediaryTokenAddress,
            destinationTokenAddress,
            wsolAccountInstructions,
            preparedTransaction,
          ]) => {
            // Second transaction
            return this._transitiveSwap({
              owner,
              pool0,
              pool1,
              fromTokenPubkey: fromWalletPubkey,
              intermediaryTokenAddress: intermediaryTokenAddress.toString(),
              destinationTokenAddress: destinationTokenAddress.toString(),
              wsolAccountInstructions,
              isDestinationNew: !toWalletPubkey,
              amount: amountNew,
              slippage,
              feePayer,
              minRentExemption,
            }).then(([a, b]) => {
              const transactions: PreparedSwapTransaction[] = [];
              if (preparedTransaction) {
                transactions.push(preparedTransaction);
              }
              transactions.push(a);
              return [transactions, b];
            });
          },
        );
      });
    }
  }

  /// Prepare for swapping and swap
  swap({
    owner,
    fromWalletPubkey,
    toWalletPubkey,
    bestPoolsPair,
    amount,
    slippage,
    isSimulation,
  }: {
    owner: Signer;
    fromWalletPubkey: string;
    toWalletPubkey?: string;
    bestPoolsPair: PoolsPair;
    amount: number;
    slippage: number;
    isSimulation: boolean;
  }): Promise<SwapResponse> {
    return this.prepareForSwapping({
      owner,
      fromWalletPubkey,
      toWalletPubkey,
      bestPoolsPair,
      amount,
      feePayer: null,
      slippage,
    }).then((params) => {
      const swapTransactions = params[0];
      if (!swapTransactions.length || swapTransactions.length > 2) {
        throw OrcaSwapError.invalidNumberOfTransactions();
      }

      let request = this.prepareAndSend({
        swapTransaction: swapTransactions[0]!,
        feePayer: owner.publicKey,
        isSimulation: swapTransactions.length === 2 ? false : isSimulation, // the first transaction in transitive swap must be non-simulation
      });

      if (swapTransactions.length === 2) {
        request = request
          .then((txId) => {
            return this._solanaClient.waitForConfirmation(txId);
          })
          .then(() => {
            return promiseRetry(
              (_retry) => {
                return this.prepareAndSend({
                  swapTransaction: swapTransactions[1]!,
                  feePayer: owner.publicKey,
                  isSimulation,
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

      return request.then((transactionId) => {
        return new SwapResponse({
          transactionId,
          newWalletPubkey: params[1],
        });
      });
    });
  }

  prepareAndSend({
    swapTransaction,
    feePayer,
    isSimulation,
  }: {
    swapTransaction: PreparedSwapTransaction;
    feePayer: PublicKey;
    isSimulation: boolean;
  }): Promise<string> {
    return this._solanaClient
      .prepareTransaction({
        instructions: swapTransaction.instructions,
        signers: swapTransaction.signers,
        feePayer,
        accountsCreationFee: swapTransaction.accountCreationFee,
        recentBlockhash: null,
      })
      .then((preparedTransaction) => {
        return this._solanaClient.serializeAndSend({
          preparedTransaction,
          isSimulation,
        });
      });
  }

  // Find routes for from and to token name, aka symbol
  private _findRoutes(fromTokenName?: string, toTokenName?: string | null): OrcaSwapRoutes {
    const info = this._info;
    if (!info) {
      throw OrcaSwapError.swapInfoMissing();
    }

    // if fromToken isn't selected
    if (!fromTokenName) {
      return {};
    }

    // if toToken isn't selected
    if (!toTokenName === null) {
      // get all routes that have token A
      return pickBy((_, key) => key.split('/').includes(fromTokenName), info.routes);
    }

    // get routes with fromToken and toToken
    const pair = [fromTokenName, toTokenName];
    const validRoutesNames = [pair.join('/'), pair.reverse().join('/')];
    return pickBy((_, key) => validRoutesNames.includes(key), info.routes);
  }

  private _directSwap({
    owner,
    pool,
    fromTokenPubkey,
    toTokenPubkey,
    amount,
    feePayer,
    slippage,
    minRentExemption,
  }: {
    owner: Signer;
    pool: OrcaSwapPool;
    fromTokenPubkey: string;
    toTokenPubkey?: string;
    amount: u64;
    feePayer?: PublicKey | null;
    slippage: number;
    minRentExemption: Lamports;
  }): Promise<[PreparedSwapTransaction, string | null]> {
    const info = this._info;
    if (!info) {
      throw OrcaSwapError.swapInfoMissing();
    }

    return constructExchange({
      pools: [pool],
      tokens: info.tokens,
      solanaClient: this._solanaClient,
      owner,
      fromTokenPubkey,
      toTokenPubkey,
      amount,
      slippage,
      feePayer,
      minRentExemption,
    }).then(([accountInstructions, accountCreationFee]) => {
      return [
        new PreparedSwapTransaction({
          instructions: accountInstructions.instructions.concat(
            accountInstructions.cleanupInstructions,
          ),
          signers: [owner].concat(accountInstructions.signers),
          accountCreationFee,
        }),
        !toTokenPubkey ? accountInstructions.account.toString() : null,
      ];
    });
  }

  private _transitiveSwap({
    owner,
    pool0,
    pool1,
    fromTokenPubkey,
    intermediaryTokenAddress,
    destinationTokenAddress,
    feePayer,
    wsolAccountInstructions,
    isDestinationNew,
    amount,
    slippage,
    minRentExemption,
  }: {
    owner: Signer;
    pool0: OrcaSwapPool;
    pool1: OrcaSwapPool;
    fromTokenPubkey: string;
    intermediaryTokenAddress: string;
    destinationTokenAddress: string;
    feePayer?: PublicKey | null;
    wsolAccountInstructions: AccountInstructions | null;
    isDestinationNew: boolean;
    amount: u64;
    slippage: number;
    minRentExemption: Lamports;
  }): Promise<[PreparedSwapTransaction, string | null]> {
    const info = this._info;
    if (!info) {
      throw OrcaSwapError.swapInfoMissing();
    }

    return constructExchange({
      pools: [pool0, pool1],
      tokens: info.tokens,
      solanaClient: this._solanaClient,
      owner,
      fromTokenPubkey,
      intermediaryTokenAddress,
      toTokenPubkey: destinationTokenAddress,
      amount,
      slippage,
      feePayer,
      minRentExemption,
    }).then(([accountInstructions, accountCreationFee]) => {
      const instructions = accountInstructions.instructions.concat(
        accountInstructions.cleanupInstructions,
      );
      const additionalSigners: Signer[] = [];
      if (wsolAccountInstructions) {
        additionalSigners.push(...wsolAccountInstructions.signers);
        instructions.unshift(...wsolAccountInstructions.instructions);
        instructions.push(...wsolAccountInstructions.cleanupInstructions);
        accountCreationFee = accountCreationFee.add(minRentExemption);
      }

      return [
        new PreparedSwapTransaction({
          instructions,
          signers: [owner].concat(additionalSigners).concat(accountInstructions.signers),
          accountCreationFee,
        }),
        isDestinationNew ? accountInstructions.account.toString() : null,
      ];
    });
  }

  createIntermediaryTokenAndDestinationTokenAddressIfNeeded({
    owner,
    pool0,
    pool1,
    // toWalletPubkey,
    feePayer,
    minRentExemption,
  }: {
    owner: Signer;
    pool0: OrcaSwapPool;
    pool1: OrcaSwapPool;
    // toWalletPubkey?: string;
    feePayer?: PublicKey | null;
    minRentExemption: Lamports;
  }): Promise<
    [PublicKey, PublicKey, AccountInstructions | null, PreparedSwapTransaction | null]
  > /*intermediaryTokenAddress, destination token address, WSOL account and instructions, account creation fee*/ {
    const intermediaryTokenMintStr = this._info?.tokens[pool0.tokenBName.toString()]?.mint;
    const intermediaryTokenMint = intermediaryTokenMintStr
      ? new PublicKey(intermediaryTokenMintStr)
      : null;
    const destinationMintStr = this._info?.tokens[pool1.tokenBName.toString()]?.mint;
    const destinationMint = destinationMintStr ? new PublicKey(destinationMintStr) : null;
    if (!intermediaryTokenMint || !destinationMint) {
      throw OrcaSwapError.unauthorized();
    }

    let requestCreatingIntermediaryToken: Promise<AccountInstructions>;

    if (intermediaryTokenMint.equals(SolanaSDKPublicKey.wrappedSOLMint)) {
      requestCreatingIntermediaryToken =
        this._solanaClient.prepareCreatingWSOLAccountAndCloseWhenDone(
          owner.publicKey,
          ZERO,
          feePayer ?? owner.publicKey,
        );
    } else {
      requestCreatingIntermediaryToken =
        this._solanaClient.prepareForCreatingAssociatedTokenAccount(
          owner.publicKey,
          intermediaryTokenMint,
          feePayer ?? owner.publicKey,
          true,
        );
    }

    return Promise.all([
      requestCreatingIntermediaryToken,
      this._solanaClient.prepareForCreatingAssociatedTokenAccount(
        owner.publicKey,
        destinationMint,
        feePayer ?? owner.publicKey,
        false,
      ),
    ]).then(([initAccountInstructions, destAccountInstructions]) => {
      // get all creating instructions, PASS WSOL ACCOUNT INSTRUCTIONS TO THE SECOND TRANSACTION
      const instructions: TransactionInstruction[] = [];
      let wsolAccountInstructions: AccountInstructions | null = null;
      let accountCreationFee: u64 = ZERO;

      if (intermediaryTokenMint.equals(SolanaSDKPublicKey.wrappedSOLMint)) {
        wsolAccountInstructions = initAccountInstructions;
        wsolAccountInstructions.cleanupInstructions = [];
      } else {
        instructions.push(...initAccountInstructions.instructions);
        if (!initAccountInstructions.instructions.length) {
          accountCreationFee = accountCreationFee.add(minRentExemption);
        }
        // omit clean up instructions
      }
      if (destinationMint.equals(SolanaSDKPublicKey.wrappedSOLMint)) {
        wsolAccountInstructions = destAccountInstructions;
      } else {
        instructions.push(...destAccountInstructions.instructions);
        if (!destAccountInstructions.instructions.length) {
          accountCreationFee = accountCreationFee.add(minRentExemption);
        }
      }

      // if token address has already been created, then no need to send any transactions
      if (!instructions.length) {
        return [
          initAccountInstructions.account,
          destAccountInstructions.account,
          wsolAccountInstructions,
          null,
        ];
      }
      // if creating transaction is needed
      else {
        return [
          initAccountInstructions.account,
          destAccountInstructions.account,
          wsolAccountInstructions,
          new PreparedSwapTransaction({
            instructions,
            signers: [owner],
            accountCreationFee,
          }),
        ];
      }
    });
  }
}

function _findAllAvailableRoutes(tokens: OrcaSwapTokens, pools: Pools): OrcaSwapRoutes {
  const filteredTokens = Object.entries(tokens)
    .filter(([, token]) => token.poolToken !== true)
    .map(([tokenName]) => tokenName);

  const pairs = _getPairs(filteredTokens);

  return _getAllRoutes(pairs, pools);
}

function _getPairs(tokens: string[]): string[][] {
  const pairs: string[][] = [];

  if (tokens.length === 0) {
    return pairs;
  }

  for (let i = 0; i + 1 < tokens.length; i++) {
    for (let j = i + 1; j < tokens.length; j++) {
      const tokenA = tokens[i]!;
      const tokenB = tokens[j]!;

      pairs.push(_orderTokenPair(tokenA, tokenB));
    }
  }

  return pairs;
}

function _orderTokenPair(tokenX: string, tokenY: string): string[] {
  if (tokenX === 'USDC' && tokenY === 'USDT') {
    return [tokenX, tokenY];
  } else if (tokenY === 'USDC' && tokenX === 'USDT') {
    return [tokenY, tokenX];
  } else if (tokenY === 'USDC' || tokenY === 'USDT') {
    return [tokenX, tokenY];
  } else if (tokenX === 'USDC' || tokenX === 'USDT') {
    return [tokenY, tokenX];
  } else if (tokenX.localeCompare(tokenY) < 0) {
    return [tokenX, tokenY];
  } else {
    return [tokenY, tokenX];
  }
}

function _getAllRoutes(pairs: string[][], pools: Pools): OrcaSwapRoutes {
  const routes: OrcaSwapRoutes = {};
  pairs.forEach((pair) => {
    const tokenA = pair[0] ?? null;
    const tokenB = pair[1] ?? null;

    if (!tokenA || !tokenB) {
      return;
    }

    routes[_getTradeId(tokenA, tokenB)] = _getRoutes(tokenA, tokenB, pools);
  });

  return routes;
}

function _getTradeId(tokenX: string, tokenY: string): string {
  return _orderTokenPair(tokenX, tokenY).join('/');
}

function _getRoutes(tokenA: string, tokenB: string, pools: Pools): OrcaSwapRoute[] {
  const routes: OrcaSwapRoute[] = [];

  // Find all pools that contain the same tokens.
  // Checking tokenAName and tokenBName will find Stable pools.
  Object.entries(pools).forEach(([poolId, poolConfig]) => {
    if (
      (poolConfig.tokenAName.toString() === tokenA &&
        poolConfig.tokenBName.toString() === tokenB) ||
      (poolConfig.tokenAName.toString() === tokenB && poolConfig.tokenBName.toString() === tokenA)
    ) {
      routes.push([poolId]);
    }
  });

  // Find all pools that contain the first token but not the second
  const firstLegPools = Object.entries(pools)
    .filter(
      ([, poolConfig]) =>
        (poolConfig.tokenAName.toString() === tokenA &&
          poolConfig.tokenBName.toString() !== tokenB) ||
        (poolConfig.tokenBName.toString() === tokenA &&
          poolConfig.tokenAName.toString() !== tokenB),
    )
    .map<[string, string]>(([poolId, poolConfig]) => [
      poolId,
      poolConfig.tokenBName.toString() === tokenA
        ? poolConfig.tokenAName.toString()
        : poolConfig.tokenBName.toString(),
    ]);

  // Find all routes that can include firstLegPool and a second pool.
  firstLegPools.forEach(([firstLegPoolId, intermediateTokenName]) => {
    Object.entries(pools).forEach(([secondLegPoolId, poolConfig]) => {
      if (
        (poolConfig.tokenAName.toString() === intermediateTokenName &&
          poolConfig.tokenBName.toString() === tokenB) ||
        (poolConfig.tokenBName.toString() === intermediateTokenName &&
          poolConfig.tokenAName.toString() === tokenB)
      ) {
        routes.push([firstLegPoolId, secondLegPoolId]);
      }
    });
  });

  return routes;
}
