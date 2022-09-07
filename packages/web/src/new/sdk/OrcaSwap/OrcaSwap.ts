import { ZERO } from '@orca-so/sdk';
import { u64 } from '@saberhq/token-utils';
import type { Signer, TransactionInstruction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import promiseRetry from 'promise-retry';
import { pickBy } from 'ramda';

import type { TokenValue } from 'new/sdk/OrcaSwap/models';
import { BalancesCache } from 'new/sdk/OrcaSwap/models/BalancesCache';
import { toLamport } from 'new/sdk/SolanaSDK/extensions/NumberExtensions';
import { SolanaSDKPublicKey } from 'new/sdk/SolanaSDK/extensions/PublicKey/PublicKeyExtensions';

import type { AccountInstructions, Lamports, TokenAccountBalance } from '../SolanaSDK';
import { SwapResponse } from '../SolanaSDK';
import * as SolanaSDK from '../SolanaSDK';
import type { APIClient } from './apiClient/APIClient';
import type { OrcaSwapSolanaClient } from './apiClient/OrcaSwapSolanaClient';
import { OrcaSwapError } from './models/OrcaSwapError';
import type { Pool } from './models/Pool';
import { OrcaSwapTokenName } from './models/Pool';
import type { Pools, PoolsPair } from './models/Pools';
import {
  calculateLiquidityProviderFees,
  constructExchange,
  getInputAmount,
  getIntermediaryToken,
  getOutputAmount,
} from './models/Pools';
import { PreparedSwapTransaction } from './models/PreparedSwapTransaction';
import type { Route, Routes } from './models/Route';
import { SwapInfo } from './models/SwapInfo';

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
    owner: PublicKey;
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
    owner: PublicKey;
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
  protected _apiClient: APIClient;
  protected _solanaClient: OrcaSwapSolanaClient;

  private _info: SwapInfo | null = null;
  private _balancesCache: BalancesCache = new BalancesCache();

  // Constructor
  constructor({
    apiClient,
    solanaClient,
  }: {
    apiClient: APIClient;
    solanaClient: OrcaSwapSolanaClient;
  }) {
    this._apiClient = apiClient;
    this._solanaClient = solanaClient;
  }

  // Methods
  /// Prepare all needed infos for swapping
  async load(): Promise<void> {
    // already been loaded
    if (this._info) {
      return Promise.resolve();
    }

    const [tokens, pools, programIds] = await Promise.all([
      this._apiClient.getTokens(),
      this._apiClient.getPools(),
      this._apiClient.getProgramID(),
    ]);

    // find all available routes
    const routes = _findAllAvailableRoutes(tokens, pools);
    const tokenNames = [...tokens].reduce((result, token) => {
      result.set(token[1].mint, token[0]);
      return result;
    }, new Map<string, string>());

    // create swap info
    const swapInfo = new SwapInfo({ routes, tokens, pools, programIds, tokenNames });

    // save cache
    this._info = swapInfo;

    return Promise.resolve();
  }

  /// Get token's mint address by its name
  getMint(tokenName: string): string | undefined {
    const info = this._info;
    if (!info?.tokenNames) {
      return;
    }

    return [...info.tokenNames].find((obj) => obj[1] === tokenName)?.[0];
  }

  /// Map mint to token info
  private _getTokenFromMint(mint?: string): { name: string; info: TokenValue } | null {
    const info = this._info;
    if (!info) {
      return null;
    }

    const tokenInfo = [...info.tokens].find(([, token]) => token.mint === mint);
    if (!tokenInfo || !tokenInfo[0] || !tokenInfo[1]) {
      return null;
    }

    return { name: tokenInfo[0], info: tokenInfo[1] };
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
        if (name && info?.tokens.get(name)?.mint) {
          acc.add(info.tokens.get(name)!.mint);
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

    const poolsPairs: PoolsPair[] = [];
    const group = await Promise.all(
      currentRoutes.map((route) => {
        // FIXME: Support more than 2 paths later
        if (route.length > 2) {
          return null;
        }

        return this.getPools({
          route,
          fromTokenName,
          toTokenName,
        });
      }),
    );

    for (const pools of group) {
      if (!pools) {
        continue;
      }
      poolsPairs.push(pools);
    }

    return poolsPairs;
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

    let bestPools: Pool[] | null = null;
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

    let bestPools: Pool[] | null = null;
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
    bestPoolsPair?: PoolsPair | null;
    inputAmount?: number | null;
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
    expectedFee.transaction = new u64(
      expectedFee.transaction.add(numberOfTransactions.mul(lamportsPerSignature)),
    );

    // when source token is native SOL
    if (fromWalletPubkey === owner.toBase58()) {
      // WSOL's signature
      expectedFee.transaction = new u64(expectedFee.transaction.add(lamportsPerSignature));
      expectedFee.deposit = new u64(expectedFee.deposit.add(minRentExempt));
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
              expectedFee.transaction = new u64(expectedFee.transaction.add(lamportsPerSignature));
              expectedFee.deposit = new u64(expectedFee.deposit.add(minRentExempt));
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
      expectedFee.accountBalances = new u64(expectedFee.accountBalances.add(minRentExempt));
    }

    return isIntermediaryTokenCreatedRequest.then((needsCreateIntermediaryToken) => {
      // Intermediary token needs to be created, so add the fee
      if (needsCreateIntermediaryToken) {
        expectedFee.accountBalances = new u64(expectedFee.accountBalances.add(minRentExempt));
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
    owner: PublicKey;
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
    owner: PublicKey;
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
        feePayer: owner,
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
                  feePayer: owner,
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
        owner: this._solanaClient.provider.wallet.publicKey,
        instructions: swapTransaction.instructions,
        signers: swapTransaction.signers,
        feePayer,
        // accountsCreationFee: swapTransaction.accountCreationFee,
        // recentBlockhash: null,
      })
      .then((preparedTransaction) => {
        return this._solanaClient.serializeAndSend({
          preparedTransaction,
          isSimulation,
        });
      });
  }

  // Find routes for from and to token name, aka symbol
  private _findRoutes(fromTokenName?: string, toTokenName?: string | null): Routes {
    const info = this._info;
    if (!info) {
      throw OrcaSwapError.swapInfoMissing();
    }

    // if fromToken isn't selected
    if (!fromTokenName) {
      return {};
    }

    // if toToken isn't selected
    if (!toTokenName) {
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
    owner: PublicKey;
    pool: Pool;
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
          owner, // instead of owner in signers
          instructions: accountInstructions.instructions.concat(
            accountInstructions.cleanupInstructions,
          ),
          signers: accountInstructions.signers,
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
    owner: PublicKey;
    pool0: Pool;
    pool1: Pool;
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
        accountCreationFee = new u64(accountCreationFee.add(minRentExemption));
      }

      return [
        new PreparedSwapTransaction({
          owner, // instead of owner in signers
          instructions,
          signers: additionalSigners.concat(accountInstructions.signers),
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
    owner: PublicKey;
    pool0: Pool;
    pool1: Pool;
    // toWalletPubkey?: string;
    feePayer?: PublicKey | null;
    minRentExemption: Lamports;
  }): Promise<
    [PublicKey, PublicKey, AccountInstructions | null, PreparedSwapTransaction | null]
  > /*intermediaryTokenAddress, destination token address, WSOL account and instructions, account creation fee*/ {
    const intermediaryTokenMintStr = this._info?.tokens.get(pool0.tokenBName.toString())?.mint;
    const intermediaryTokenMint = intermediaryTokenMintStr
      ? new PublicKey(intermediaryTokenMintStr)
      : null;
    const destinationMintStr = this._info?.tokens.get(pool1.tokenBName.toString())?.mint;
    const destinationMint = destinationMintStr ? new PublicKey(destinationMintStr) : null;
    if (!intermediaryTokenMint || !destinationMint) {
      throw OrcaSwapError.unauthorized();
    }

    let requestCreatingIntermediaryToken: Promise<AccountInstructions>;

    if (intermediaryTokenMint.equals(SolanaSDKPublicKey.wrappedSOLMint)) {
      requestCreatingIntermediaryToken =
        this._solanaClient.prepareCreatingWSOLAccountAndCloseWhenDone(
          owner,
          ZERO,
          feePayer ?? owner,
        );
    } else {
      requestCreatingIntermediaryToken =
        this._solanaClient.prepareForCreatingAssociatedTokenAccount(
          owner,
          intermediaryTokenMint,
          feePayer ?? owner,
          true,
        );
    }

    return Promise.all([
      requestCreatingIntermediaryToken,
      this._solanaClient.prepareForCreatingAssociatedTokenAccount(
        owner,
        destinationMint,
        feePayer ?? owner,
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
          accountCreationFee = new u64(accountCreationFee.add(minRentExemption));
        }
        // omit clean up instructions
      }
      if (destinationMint.equals(SolanaSDKPublicKey.wrappedSOLMint)) {
        wsolAccountInstructions = destAccountInstructions;
      } else {
        instructions.push(...destAccountInstructions.instructions);
        if (!destAccountInstructions.instructions.length) {
          accountCreationFee = new u64(accountCreationFee.add(minRentExemption));
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
            owner, // instead of owner in signers
            instructions,
            accountCreationFee,
          }),
        ];
      }
    });
  }

  async getPools({
    route,
    fromTokenName,
    toTokenName,
  }: {
    route: Route;
    fromTokenName: string;
    toTokenName: string;
  }): Promise<Pool[]> {
    if (route.length === 0) {
      return [];
    }

    const pools: Pool[] = [];
    const group = await Promise.all(route.map((path) => this.fixedPool({ path })));

    for (const pool of group) {
      if (!pool) {
        continue;
      }
      pools.push(pool);
    }

    // modify orders
    if (pools.length === 2) {
      // reverse order of the 2 pools
      // Ex: Swap from SOCN -> BTC, but paths are
      // [
      //     "BTC/SOL[aquafarm]",
      //     "SOCN/SOL[stable][aquafarm]"
      // ]
      // Need to change to
      // [
      //     "SOCN/SOL[stable][aquafarm]",
      //     "BTC/SOL[aquafarm]"
      // ]

      if (
        pools[0]!.tokenAName.toString() !== fromTokenName &&
        pools[0]!.tokenBName.toString() !== fromTokenName
      ) {
        const temp = pools[0]!;
        pools[0] = pools[1]!;
        pools[1] = temp;
      }
    }

    // reverse token A and token B in pool if needed
    for (let i = 0; i < pools.length; i++) {
      if (i === 0) {
        let pool = pools[0]!;
        if (
          pool.tokenAName.fixedTokenName !== new OrcaSwapTokenName(fromTokenName).fixedTokenName
        ) {
          pool = pool.reversed;
        }
        pools[0] = pool;
      }

      if (i === 1) {
        let pool = pools[1]!;
        if (pool.tokenBName.fixedTokenName !== new OrcaSwapTokenName(toTokenName).fixedTokenName) {
          pool = pool.reversed;
        }
        pools[1] = pool;
      }
    }

    return pools;
  }

  async fixedPool({
    path,
  }: {
    path: string; // Ex. BTC/SOL[aquafarm][stable]
  }): Promise<Pool | null> {
    const allPools = this._info?.pools;
    if (!allPools) {
      return null;
    }
    const pool = allPools.get(path);
    if (!pool) {
      return null;
    }

    if (path.includes('[stable]')) {
      pool.isStable = true;
    }

    // get balances
    let tokenABalance: TokenAccountBalance;
    let tokenBBalance: TokenAccountBalance;

    const tab = this._balancesCache.getTokenABalance(pool);
    const tbb = this._balancesCache.getTokenBBalance(pool);
    if (tab && tbb) {
      [tokenABalance, tokenBBalance] = [tab, tbb];
    } else {
      [tokenABalance, tokenBBalance] = await Promise.all([
        this._solanaClient.getTokenAccountBalance(pool.tokenAccountA),
        this._solanaClient.getTokenAccountBalance(pool.tokenAccountB),
      ]);
    }

    this._balancesCache.save(pool.tokenAccountA.toString(), tokenABalance);
    this._balancesCache.save(pool.tokenAccountB.toString(), tokenBBalance);

    pool.tokenABalance = tokenABalance;
    pool.tokenBBalance = tokenBBalance;

    return pool;
  }
}

function _findAllAvailableRoutes(tokens: Map<string, TokenValue>, pools: Pools): Routes {
  const filteredTokens = [...tokens]
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

function _getAllRoutes(pairs: string[][], pools: Pools): Routes {
  const routes: Routes = {};
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

function _getRoutes(tokenA: string, tokenB: string, pools: Pools): Route[] {
  const routes: Route[] = [];

  // Find all pools that contain the same tokens.
  // Checking tokenAName and tokenBName will find Stable pools.
  [...pools].forEach(([poolId, poolConfig]) => {
    if (
      (poolConfig.tokenAName.toString() === tokenA &&
        poolConfig.tokenBName.toString() === tokenB) ||
      (poolConfig.tokenAName.toString() === tokenB && poolConfig.tokenBName.toString() === tokenA)
    ) {
      routes.push([poolId]);
    }
  });

  // Find all pools that contain the first token but not the second
  const firstLegPools = [...pools]
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
    [...pools].forEach(([secondLegPoolId, poolConfig]) => {
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
