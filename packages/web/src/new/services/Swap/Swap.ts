import type { u64 } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { last } from 'ramda';
import { injectable } from 'tsyringe';

import type { PayingFeeInfo } from 'new/app/models/PayingFee';
import { FeeType, PayingFee } from 'new/app/models/PayingFee';
import type { FeeRelayerContext } from 'new/sdk/FeeRelayer';
import {
  FeeRelayerAPIClient,
  FeeRelayerConfiguration,
  FeeRelayerRelaySolanaClient,
  StatsInfoOperationType,
  TokenAccount,
} from 'new/sdk/FeeRelayer';
import { FeeRelayerContextManager } from 'new/sdk/FeeRelayer/relay';
import type { PoolsPair } from 'new/sdk/OrcaSwap';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { convertToBalance, FeeAmount, SolanaSDKPublicKey, Token } from 'new/sdk/SolanaSDK';
import { OrcaSwapService } from 'new/services/OrcaSwapService';
import { RelayService } from 'new/services/RelayService';
import { SolanaService } from 'new/services/SolanaService';
import { SwapRelayService } from 'new/services/SwapRelayService';

enum InputMode {
  source,
  target,
}

enum PayingTokenMode {
  /// Allow to use any token to pay a fee
  any = 'any',
  /// Only allow to use native sol to pay a fee
  onlySol = 'onlySol',
}

interface SwapInfo {
  // This property defines a mode for paying fee.
  payingTokenMode: PayingTokenMode;
}

interface FeeInfo {
  /**
   Get all fees categories. For example: account creation fee, network fee, etc.
   */
  fees: PayingFee[];
}

//  This interface describes an interface for swapping service.
//  In general you have to call `load` method first to prepare a service.
export interface SwapServiceType {
  /**
   Prepare swap service.
   - Returns: `Promise`.
   */
  load(): Promise<void>;

  /**
   Determine the all exchange route.
   - Parameters:
   - sourceMint: the source mint address.
   - destinationMint: the destination mint address.
   - Returns: Exchange route.
   */
  getPoolPair({
    sourceMint,
    destinationMint,
  }: {
    sourceMint: string;
    destinationMint: string;
  }): Promise<PoolsPair[]>;

  /**
   Process swap
   - Parameters:
   - sourceAddress: the source address of token in user's wallet.
   - sourceTokenMint: the source mint address of source address.
   - destinationAddress: the destination address of token in wallet, that user wants to swap to.
   - destinationTokenMint: the destination mint address of destination address.
   - payingTokenAddress: the address of token, that will be used as fee paying address.
   - payingTokenMint: the mint address of paying token.
   - poolsPair: the user's selected exchange route. Normally it's the best.
   - amount: the amount of source token.
   - slippage:
   - Returns: The id of transaction.
   */
  swap({
    sourceAddress,
    sourceTokenMint,
    destinationAddress,
    destinationTokenMint,
    payingTokenAddress,
    payingTokenMint,
    poolsPair,
    amount,
    slippage,
  }: {
    sourceAddress: string;
    sourceTokenMint: string;
    destinationAddress?: string | null;
    destinationTokenMint: string;
    payingTokenAddress?: string | null;
    payingTokenMint?: string | null;
    poolsPair: PoolsPair;
    amount: u64;
    slippage: number;
  }): Promise<string[]>;

  /**
   Calculate fee for swapping
   - Parameters:
   - sourceMint: the source mint of token in user's wallet.
   - destinationAddress: the destination address of token in wallet, that user wants to swap to.
   - destinationToken: the destination token.
   - bestPoolsPair: the user's selected exchange route
   - inputAmount: the amount of swapping.
   - slippage:
   - Returns: The detailed fee information
   - Throws:
   */
  getFees({
    sourceMint,
    destinationAddress,
    destinationToken,
    bestPoolsPair,
    payingWallet,
    inputAmount,
    slippage,
  }: {
    sourceMint: string;
    destinationAddress?: string | null;
    destinationToken: Token;
    bestPoolsPair?: PoolsPair | null;
    payingWallet?: Wallet | null;
    inputAmount?: number | null;
    slippage: number;
  }): Promise<FeeInfo>;

  /**
   Find all possible destination mint addresses.
   - Parameter fromMint:
   - Returns: The list of mint addresses
   - Throws:
   */
  findPosibleDestinationMints(fromMint: string): string[];

  /**
   Calculate amount needed for paying fee in paying token
   */
  calculateNetworkFeeInPayingToken({
    networkFee,
    payingTokenMint,
  }: {
    networkFee: FeeAmount;
    payingTokenMint: string;
  }): Promise<FeeAmount | null>;
}

export class SwapError extends Error {
  static incompatiblePoolsPair() {
    return new SwapError('incompatiblePoolsPair');
  }
  static feeRelayIsNotReady() {
    return new SwapError('feeRelayIsNotReady');
  }
}

@injectable()
export class SwapService implements SwapServiceType {
  private _feeRelayerContextManager: FeeRelayerContextManager;

  constructor(
    private _solanaAPIClient: SolanaService,
    private _orcaSwap: OrcaSwapService,
    private _relayService: RelayService,
    private _swapRelayService: SwapRelayService,
    private _feeRelayerRelaySolanaClient: FeeRelayerRelaySolanaClient,
  ) {
    const feeRelayerAPIClient = new FeeRelayerAPIClient();
    this._feeRelayerContextManager = new FeeRelayerContextManager({
      owner: _solanaAPIClient.provider.wallet.publicKey,
      solanaAPIClient: this._feeRelayerRelaySolanaClient,
      feeRelayerAPIClient,
    });
  }

  async load(): Promise<void> {
    await this._orcaSwap.load();
    await this._feeRelayerContextManager.update();
  }

  getPoolPair({
    sourceMint,
    destinationMint,
  }: {
    sourceMint: string;
    destinationMint: string;
  }): Promise<PoolsPair[]> {
    return this._orcaSwap.getTradablePoolsPairs({
      fromMint: sourceMint,
      toMint: destinationMint,
    });
  }

  async getFees({
    sourceMint,
    destinationAddress,
    destinationToken,
    bestPoolsPair,
    payingWallet,
    inputAmount,
    slippage,
  }: {
    sourceMint: string;
    destinationAddress?: string | null;
    destinationToken: Token;
    bestPoolsPair?: PoolsPair | null;
    payingWallet?: Wallet | null;
    inputAmount?: number | null;
    slippage: number;
  }): Promise<FeeInfo> {
    // Network fees
    let networkFees: PayingFee[];
    if (payingWallet) {
      // Network fee for swapping via relay program
      networkFees = await this._getNetworkFeesForSwappingViaRelayProgram({
        swapPools: bestPoolsPair,
        sourceMint,
        destinationAddress,
        destinationToken,
        payingWallet,
      });
    } else {
      networkFees = [];
    }

    // Liquidity provider fee
    const liquidityProviderFees = this._getLiquidityProviderFees({
      poolsPair: bestPoolsPair,
      destinationAddress,
      destinationToken,
      inputAmount,
      slippage,
    });

    return {
      fees: networkFees.concat(liquidityProviderFees),
    };
  }

  findPosibleDestinationMints(fromMint: string): string[] {
    return this._orcaSwap.findPosibleDestinationMints(fromMint);
  }

  async calculateNetworkFeeInPayingToken({
    networkFee,
    payingTokenMint,
  }: {
    networkFee: FeeAmount;
    payingTokenMint: string;
  }): Promise<FeeAmount | null> {
    if (payingTokenMint === SolanaSDKPublicKey.wrappedSOLMint.toString()) {
      return networkFee;
    }
    return this._relayService.feeCalculator.calculateFeeInPayingToken({
      orcaSwap: this._orcaSwap,
      feeInSOL: networkFee,
      payingFeeTokenMint: new PublicKey(payingTokenMint),
    });
  }

  swap({
    sourceAddress,
    sourceTokenMint,
    destinationAddress,
    destinationTokenMint,
    payingTokenAddress,
    payingTokenMint,
    poolsPair,
    amount,
    slippage,
  }: {
    sourceAddress: string;
    sourceTokenMint: string;
    destinationAddress?: string;
    destinationTokenMint: string;
    payingTokenAddress?: string;
    payingTokenMint?: string;
    poolsPair: PoolsPair;
    amount: u64;
    slippage: number;
  }): Promise<string[]> {
    if (!poolsPair.length) {
      throw SwapError.incompatiblePoolsPair();
    }
    const decimals = poolsPair[0]!.getTokenADecimals();
    if (!decimals) {
      throw SwapError.incompatiblePoolsPair();
    }

    return this._swapViaRelayProgram({
      sourceAddress,
      sourceTokenMint,
      destinationAddress,
      destinationTokenMint,
      payingTokenAddress,
      payingTokenMint,
      poolsPair,
      amount,
      decimals,
      slippage,
    });
  }

  private _getLiquidityProviderFees({
    poolsPair,
    destinationAddress,
    destinationToken,
    inputAmount,
    slippage,
  }: {
    poolsPair?: PoolsPair | null;
    destinationAddress?: string | null;
    destinationToken?: Token;
    inputAmount?: number | null;
    slippage: number;
  }): PayingFee[] {
    const allFees: PayingFee[] = [];

    const liquidityProviderFees = this._orcaSwap.getLiquidityProviderFee({
      bestPoolsPair: poolsPair,
      inputAmount,
      slippage,
    });

    if (poolsPair && destinationAddress && destinationToken) {
      if (liquidityProviderFees.length === 1) {
        allFees.push(
          new PayingFee({
            type: FeeType.liquidityProviderFee,
            lamports: liquidityProviderFees[0]!,
            token: destinationToken,
          }),
        );
      } else if (liquidityProviderFees.length === 2) {
        const intermediaryTokenName = poolsPair[0]!.tokenBName;
        const decimals = poolsPair[0]!.getTokenBDecimals();
        if (decimals) {
          allFees.push(
            new PayingFee({
              type: FeeType.liquidityProviderFee,
              lamports: liquidityProviderFees[0]!,
              token: Token.unsupported({
                decimals,
                symbol: intermediaryTokenName.toString(),
              }),
            }),
          );
        }

        allFees.push(
          new PayingFee({
            type: FeeType.liquidityProviderFee,
            lamports: last(liquidityProviderFees)!,
            token: destinationToken,
          }),
        );
      }
    }

    return allFees;
  }

  private async _getNetworkFeesForSwappingViaRelayProgram({
    swapPools,
    sourceMint,
    destinationAddress,
    destinationToken,
    payingWallet,
  }: {
    swapPools?: PoolsPair | null;
    sourceMint: string;
    destinationAddress?: string | null;
    destinationToken: Token;
    payingWallet: Wallet;
  }): Promise<PayingFee[]> {
    const context = await this._feeRelayerContextManager.getCurrentContext();

    let networkFee = await this._swapRelayService.calculator.calculateSwappingNetworkFees({
      context,
      swapPools,
      sourceTokenMint: new PublicKey(sourceMint),
      destinationTokenMint: new PublicKey(destinationToken.address),
      destinationAddress: destinationAddress ? new PublicKey(destinationAddress) : undefined,
    });

    // when free transaction is not available and user is paying with sol, let him do this the normal way (don't use fee relayer)
    if (
      this._isSwappingNatively({
        context,
        expectedTransactionFee: networkFee.transaction,
        payingTokenMint: payingWallet.mintAddress,
      })
    ) {
      networkFee.transaction = networkFee.transaction.sub(context.lamportsPerSignature);
    } else {
      // send via fee relayer
      networkFee = this._relayService.feeCalculator.calculateNeededTopUpAmount({
        context,
        expectedFee: networkFee,
        payingTokenMint: new PublicKey(payingWallet.mintAddress),
      });
    }

    let neededTopUpAmount: FeeAmount;
    if (payingWallet.mintAddress === SolanaSDKPublicKey.wrappedSOLMint.toString()) {
      neededTopUpAmount = networkFee;
    } else {
      // TODO: Zero?
      neededTopUpAmount =
        (await this._relayService.feeCalculator.calculateFeeInPayingToken({
          orcaSwap: this._orcaSwap,
          feeInSOL: networkFee,
          payingFeeTokenMint: new PublicKey(payingWallet.mintAddress),
        })) ?? FeeAmount.zero();
    }

    const freeTransactionFeeLimit = context.usageStatus;

    const allFees: PayingFee[] = [];
    let isFree = false;
    let info: PayingFeeInfo | null = null;

    if (neededTopUpAmount.transaction.eqn(0)) {
      isFree = true;

      const numberOfFreeTransactionsLeft =
        freeTransactionFeeLimit.maxUsage - freeTransactionFeeLimit.currentUsage;
      const maxUsage = freeTransactionFeeLimit.maxUsage;

      info = {
        alertTitle: `There are ${numberOfFreeTransactionsLeft} free transactions left for today`,
        alertDescription: `On the Solana network, the first ${maxUsage} transactions in a day are paid by P2P.org. Subsequent transactions will be charged based on the Solana blockchain gas fee.`,
        payBy: 'Paid by p2p.org',
      };
    }

    if (
      this._isSwappingNatively({
        context,
        payingTokenMint: SolanaSDKPublicKey.wrappedSOLMint.toString(),
      })
    ) {
      allFees.push(
        new PayingFee({
          type: FeeType.depositWillBeReturned,
          lamports: context.minimumTokenAccountBalance,
          token: Token.nativeSolana,
        }),
      );
    }

    if (neededTopUpAmount.accountBalances.gtn(0)) {
      allFees.push(
        new PayingFee({
          type: FeeType.accountCreationFee(destinationToken.symbol),
          lamports: neededTopUpAmount.accountBalances,
          token: payingWallet.token,
        }),
      );
    }

    allFees.push(
      new PayingFee({
        type: FeeType.transactionFee,
        lamports: neededTopUpAmount.transaction,
        token: payingWallet.token,
        isFree,
        info,
      }),
    );

    return allFees;
  }

  private async _swapViaRelayProgram({
    sourceAddress,
    sourceTokenMint,
    destinationAddress,
    destinationTokenMint,
    payingTokenAddress,
    payingTokenMint,
    poolsPair,
    amount,
    decimals,
    slippage,
  }: {
    sourceAddress: string;
    sourceTokenMint: string;
    destinationAddress?: string;
    destinationTokenMint: string;
    payingTokenAddress?: string;
    payingTokenMint?: string;
    poolsPair: PoolsPair;
    amount: u64;
    decimals: number;
    slippage: number;
  }): Promise<string[]> {
    const context = await this._feeRelayerContextManager.getCurrentContext();

    let payingFeeToken: TokenAccount | null = null;
    if (payingTokenAddress && payingTokenMint) {
      payingFeeToken = new TokenAccount({
        address: new PublicKey(payingTokenAddress),
        mint: new PublicKey(payingTokenMint),
      });
    }

    if (
      this._isSwappingNatively({
        context,
        payingTokenMint,
      })
    ) {
      const id = await this._orcaSwap.swap({
        owner: this._solanaAPIClient.provider.wallet.publicKey,
        fromWalletPubkey: sourceAddress,
        toWalletPubkey: destinationAddress,
        bestPoolsPair: poolsPair,
        amount: convertToBalance(amount, decimals),
        slippage,
        isSimulation: false,
      });
      return [id.transactionId];
    }

    const preparedTransactions = await this._swapRelayService.prepareSwapTransaction({
      context,
      sourceToken: new TokenAccount({
        address: new PublicKey(sourceAddress),
        mint: new PublicKey(sourceTokenMint),
      }),
      destinationTokenMint: new PublicKey(destinationTokenMint),
      destinationAddress: destinationAddress ? new PublicKey(destinationAddress) : null,
      fee: payingFeeToken,
      swapPools: poolsPair,
      inputAmount: amount,
      slippage,
    });

    return this._relayService.topUpAndRelayTransactions({
      context,
      transactions: preparedTransactions.transactions,
      fee: payingFeeToken,
      config: new FeeRelayerConfiguration({
        additionalPaybackFee: preparedTransactions.additionalPaybackFee,
        operationType: StatsInfoOperationType.swap,
        currency: sourceTokenMint,
      }),
    });
  }

  /// when free transaction is not available and user is paying with sol, let him do this the normal way (don't use fee relayer)
  private _isSwappingNatively({
    context,
    expectedTransactionFee = null,
    payingTokenMint,
  }: {
    context: FeeRelayerContext;
    expectedTransactionFee?: u64 | null;
    payingTokenMint?: string;
  }): boolean {
    const _expectedTransactionFee = expectedTransactionFee ?? context.lamportsPerSignature.muln(2);
    return (
      payingTokenMint === SolanaSDKPublicKey.wrappedSOLMint.toString() &&
      !context.usageStatus.isFreeTransactionFeeAvailable({
        transactionFee: _expectedTransactionFee,
      })
    );
  }
}
