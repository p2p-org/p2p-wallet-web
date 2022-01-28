import { useEffect, useMemo, useState } from 'react';

import type { TokenAccount } from '@p2p-wallet-web/core';
import { u64 } from '@solana/spl-token';

import type { ProgramIds } from 'app/contexts/solana/swap';
import { useConfig, usePools } from 'app/contexts/solana/swap';
import SlippageTolerance from 'app/contexts/solana/swap/models/SlippageTolerance';
import Trade from 'app/contexts/solana/swap/models/Trade';
import { getMaxAge } from 'app/contexts/solana/swap/utils/AsyncCache';
import { getTradeId } from 'app/contexts/solana/swap/utils/pools';

const DEFAULT_SLIPPAGE_TOLERANCE_STATE = { numerator: '10', denominator: '1000' };

const makeSplData = (
  pool,
  programIds: ProgramIds,
  outputTokenName: string,
  amountIn: u64,
  minimumAmountOut: u64,
) => {
  const [inputPoolTokenPublicKey, outputPoolTokenPublicKey] =
    pool.poolConfig.tokenAName === outputTokenName
      ? [pool.poolConfig.tokenAccountB, pool.poolConfig.tokenAccountA]
      : [pool.poolConfig.tokenAccountA, pool.poolConfig.tokenAccountB];

  return {
    swapProgramId: pool.getSwapProgramId(programIds),
    swapAccount: pool.poolConfig.account,
    swapAuthority: pool.poolConfig.authority,
    swapSource: inputPoolTokenPublicKey,
    swapDestination: outputPoolTokenPublicKey,
    poolTokenMint: pool.poolConfig.poolTokenMint,
    poolFeeAccount: pool.poolConfig.feeAccount,
    amountIn,
    minimumAmountOut,
  };
};

export const useCompensationSwap = (compensationAmount: u64, feeToken: TokenAccount) => {
  const { tokenConfigs, routeConfigs, programIds } = useConfig();

  const inputTokenName = feeToken.balance?.token.symbol || '';
  const outputTokenName = 'SOL';
  const amount = compensationAmount;

  const slippageTolerance = useMemo(() => {
    return new SlippageTolerance(
      new u64(DEFAULT_SLIPPAGE_TOLERANCE_STATE.numerator),
      new u64(DEFAULT_SLIPPAGE_TOLERANCE_STATE.denominator),
    );
  }, []);

  const [trade, setTrade] = useState<Trade>(
    () =>
      new Trade({
        inputTokenName,
        outputTokenName,
        amount,
        isInputAmount: false,
        outputTooHigh: false,
        slippageTolerance,
        tokenConfigs,
        routes: routeConfigs[getTradeId(inputTokenName, outputTokenName)],
      }),
  );

  const tradeId = getTradeId(trade.inputTokenName, trade.outputTokenName);

  const [isRefreshRateIncreased, setIsRefreshRateIncreased] = useState(false);
  const maxAge = getMaxAge(isRefreshRateIncreased);

  const { useAsyncBatchedPools, fetchPool } = usePools();
  const poolIds = routeConfigs[tradeId]
    .flat()
    .filter((poolId, idx, list) => list.indexOf(poolId) === idx);
  const asyncPools = useAsyncBatchedPools(poolIds, maxAge);

  useEffect(() => {
    if (!trade.pools && asyncPools.value) {
      setTrade(trade.updatePools(asyncPools.value));
    }
  }, [trade, asyncPools.value]);

  useEffect(() => {
    if (asyncPools.value) {
      setTrade((trade) => trade.updatePools(asyncPools.value));
    }
  }, [asyncPools]);

  useEffect(() => {
    if (trade.inputTokenName !== inputTokenName) {
      const routes = routeConfigs[getTradeId(inputTokenName, trade.outputTokenName)];
      setTrade(trade.updateInputToken(inputTokenName, routes));
    }
  }, [inputTokenName, routeConfigs, trade]);

  useEffect(() => {
    if (!trade.getOutputAmount().eq(amount)) {
      setTrade(trade.updateOutputAmount(amount));
    }
  }, [amount, trade]);

  const swapData = useMemo(() => {
    if (!trade.pools) {
      return null;
    }
    if (!trade.derivedFields.doubleHopFields) {
      const pool = trade.pools[trade.derivedFields.selectedRoute[0]];

      const swapData = makeSplData(
        pool,
        programIds,
        outputTokenName,
        trade.getInputAmount(),
        trade.derivedFields.minimumOutputAmount,
      );

      return {
        Spl: swapData,
      };
    } else {
      const pool0 = trade.pools[trade.derivedFields.selectedRoute[0]];

      const from = makeSplData(
        pool0,
        programIds,
        trade.derivedFields.doubleHopFields.intermediateTokenName,
        trade.getInputAmount(),
        trade.derivedFields.doubleHopFields.minimumIntermediateOutputAmount,
      );

      const transitTokenMintPubkey =
        tokenConfigs[trade.derivedFields.doubleHopFields.intermediateTokenName].mint;

      const pool1 = trade.pools[trade.derivedFields.selectedRoute[1]];

      const to = makeSplData(
        pool1,
        programIds,
        outputTokenName,
        trade.derivedFields.doubleHopFields.intermediateOutputAmount,
        trade.derivedFields.minimumOutputAmount,
      );

      return {
        SplTransitive: { from, to, transitTokenMintPubkey },
      };
    }
  }, [programIds, tokenConfigs, trade]);

  return {
    inputAmount: trade.getInputAmount(),
    swapData,
  };
};
