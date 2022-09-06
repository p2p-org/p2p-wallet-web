import type { u64 } from '@solana/spl-token';
import type { PublicKey } from '@solana/web3.js';

import type { BuildContext } from 'new/sdk/FeeRelayer';
import { DefaultSwapFeeRelayerCalculator, FeeRelayerError } from 'new/sdk/FeeRelayer';
import type { TokenAccount } from 'new/sdk/FeeRelayer/models';
import type {
  FeeRelayerCalculator,
  FeeRelayerContext,
  FeeRelayerRelaySolanaClient,
  TopUpAndActionPreparedParams,
  TopUpPreparedParams,
} from 'new/sdk/FeeRelayer/relay';
import { DefaultFeeRelayerCalculator } from 'new/sdk/FeeRelayer/relay';
import { SwapTransactionBuilder } from 'new/sdk/FeeRelayer/swap/transactionBuilder/SwapTransactionBuilder';
import type { OrcaSwap, PoolsPair } from 'new/sdk/OrcaSwap';
import type { PreparedTransaction } from 'new/sdk/SolanaSDK';
import { SolanaSDKPublicKey } from 'new/sdk/SolanaSDK';

import type { SwapFeeRelayerCalculator } from './calculator';

interface SwapFeeRelayerType {
  calculator: SwapFeeRelayerCalculator;

  prepareSwapTransaction({
    context,
    sourceToken,
    destinationTokenMint,
    destinationAddress,
    fee,
    swapPools,
    inputAmount,
    slippage,
  }: {
    context: FeeRelayerContext;
    sourceToken: TokenAccount;
    destinationTokenMint: PublicKey;
    destinationAddress?: PublicKey;
    fee?: TokenAccount;
    swapPools: PoolsPair;
    inputAmount: u64;
    slippage: number;
  }): Promise<{
    transactions: PreparedTransaction[];
    additionalPaybackFee: u64;
  }>;
}

// The service that allows users to create gas-less swap transactions.
export class SwapFeeRelayer implements SwapFeeRelayerType {
  get userAccount(): PublicKey {
    return this._owner;
  }

  private _owner: PublicKey;
  private _solanaApiClient: FeeRelayerRelaySolanaClient;
  private _orcaSwap: OrcaSwap;

  private _swapCalculator: SwapFeeRelayerCalculator;
  private _feeRelayerCalculator: FeeRelayerCalculator;

  constructor({
    owner,
    solanaApiClient,
    orcaSwap,
    feeRelayerCalculator = new DefaultFeeRelayerCalculator(),
  }: {
    owner: PublicKey;
    solanaApiClient: FeeRelayerRelaySolanaClient;
    orcaSwap: OrcaSwap;
    feeRelayerCalculator?: FeeRelayerCalculator;
  }) {
    this._owner = owner;
    this._solanaApiClient = solanaApiClient;
    this._orcaSwap = orcaSwap;
    this._feeRelayerCalculator = feeRelayerCalculator;

    this._swapCalculator = new DefaultSwapFeeRelayerCalculator({
      solanaApiClient,
      owner,
    });
  }

  get calculator(): SwapFeeRelayerCalculator {
    return this._swapCalculator;
  }

  /// Prepare swap transaction for relay
  async prepareSwapTransaction({
    context,
    sourceToken,
    destinationTokenMint,
    destinationAddress,
    fee,
    swapPools,
    inputAmount,
    slippage,
  }: {
    context: FeeRelayerContext;
    sourceToken: TokenAccount;
    destinationTokenMint: PublicKey;
    destinationAddress?: PublicKey | null;
    fee?: TokenAccount | null;
    swapPools: PoolsPair;
    inputAmount: u64;
    slippage: number;
  }): Promise<{
    transactions: PreparedTransaction[];
    additionalPaybackFee: u64;
  }> {
    const preparedParams = await this._prepareForTopUpAndSwap({
      context,
      source: sourceToken,
      destinationTokenMint,
      destinationAddress,
      payingFeeToken: fee,
      swapPools,
    });

    const latestBlockhash = await this._solanaApiClient.getRecentBlockhash();

    const buildContext = <BuildContext>{
      feeRelayerContext: context,
      solanaApiClient: this._solanaApiClient,
      orcaSwap: this._orcaSwap,
      config: {
        userAccount: this.userAccount,
        pools: preparedParams.actionFeesAndPools.poolsPair,
        inputAmount,
        slippage,
        sourceAccount: sourceToken,
        destinationTokenMint,
        destinationAddress,
        blockhash: latestBlockhash,
      },
      env: {},
    };

    return SwapTransactionBuilder.prepareSwapTransaction(buildContext);
  }

  private async _prepareForTopUpAndSwap({
    context,
    source,
    destinationTokenMint,
    destinationAddress,
    payingFeeToken,
    swapPools,
  }: {
    context: FeeRelayerContext;
    source: TokenAccount;
    destinationTokenMint: PublicKey;
    destinationAddress?: PublicKey | null;
    payingFeeToken?: TokenAccount | null;
    swapPools: PoolsPair;
  }): Promise<TopUpAndActionPreparedParams> {
    const swappingFee = await this._swapCalculator.calculateSwappingNetworkFees({
      context,
      swapPools,
      sourceTokenMint: source.mint,
      destinationTokenMint,
      destinationAddress,
    });

    // TOP UP
    let topUpPreparedParam: TopUpPreparedParams | null;
    const balance = context.relayAccountStatus.balance;
    if (
      !payingFeeToken?.mint.equals(SolanaSDKPublicKey.wrappedSOLMint) &&
      balance &&
      balance.lt(swappingFee.total)
    ) {
      // Get real amounts needed for topping up
      const topUpAmount = this._feeRelayerCalculator.calculateNeededTopUpAmount({
        context,
        expectedFee: swappingFee,
        payingTokenMint: payingFeeToken?.mint,
      }).total;

      const expectedFee = this._feeRelayerCalculator.calculateExpectedFeeForTopUp(context);

      // Get pools
      let tradablePoolsPair: PoolsPair[];
      if (payingFeeToken) {
        tradablePoolsPair = await this._orcaSwap.getTradablePoolsPairs({
          fromMint: payingFeeToken.mint.toString(),
          toMint: SolanaSDKPublicKey.wrappedSOLMint.toString(),
        });
      } else {
        tradablePoolsPair = [];
      }

      const topUpPools = this._orcaSwap.findBestPoolsPairForEstimatedAmount({
        estimatedAmount: topUpAmount,
        poolsPairs: tradablePoolsPair,
      });
      if (!topUpPools) {
        throw FeeRelayerError.swapPoolsNotFound();
      }

      topUpPreparedParam = {
        amount: topUpAmount,
        expectedFee: expectedFee,
        poolsPair: topUpPools,
      };
    } else {
      topUpPreparedParam = null;
    }

    return {
      topUpPreparedParam,
      actionFeesAndPools: {
        fee: swappingFee,
        poolsPair: swapPools,
      },
    };
  }
}
