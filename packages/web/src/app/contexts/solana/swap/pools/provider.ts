import { useSolana } from '@p2p-wallet-web/core';
import { createContainer } from 'unstated-next';

import { useConfig } from 'app/contexts/solana/swap';

import ConstantProductPool from '../models/ConstantProductPool';
import StablePool from '../models/StablePool';
import type TradeablePoolInterface from '../models/TradeablePoolInterface';
import { CurveType } from '../orca-commons';
import type { AsyncResult } from '../utils/AsyncCache';
import AsyncCache, { DEFAULT_MAX_AGE } from '../utils/AsyncCache';
import { fetchPoolAmounts, getTradeId } from '../utils/pools';

export type TradeablePoolsMap = {
  [key: string]: TradeablePoolInterface;
};

export enum PoolError {
  // eslint-disable-next-line no-unused-vars
  DOES_NOT_EXIST = 'Pool does not exist',
  // eslint-disable-next-line no-unused-vars
  UNSUPPORTED_TYPE = 'Pool type not supported',
}

const poolCache = new AsyncCache<TradeablePoolInterface>();

export interface UsePools {
  fetchPool(poolName: string): Promise<TradeablePoolInterface> | undefined;
  fetchPoolsForTokenPair(
    tokenA: string,
    tokenB: string,
  ): Promise<(TradeablePoolInterface | undefined)[]>;
  useAsyncPool(poolName: string, maxAge?: number): AsyncResult<TradeablePoolInterface>;
  useAsyncBatchedPools(poolIds: string[], maxAge?: number): AsyncResult<TradeablePoolsMap>;
}

const usePoolsInternal = (): UsePools => {
  const { connection } = useSolana();
  const { routeConfigs, tokenConfigs, poolConfigs, programIds } = useConfig();

  function fetchPool(poolId: string) {
    return poolCache.refreshCache(poolId);
  }

  /**
   * Fetch the latest value of all pools that could be used to route from tokenA to tokenB
   * @param tokenA The name of the first token to trade, e.g. ETH
   * @param tokenB The name of the second token to trade, e.g. SOL
   */
  function fetchPoolsForTokenPair(tokenA: string, tokenB: string) {
    const tradeId = getTradeId(tokenA, tokenB);
    const poolIds = routeConfigs[tradeId]
      .flat()
      .filter((poolId, idx, list) => list.indexOf(poolId) === idx);

    return Promise.all(poolIds.map((poolId) => fetchPool(poolId)));
  }

  function createPoolAsyncFn(poolId: string): () => Promise<TradeablePoolInterface> {
    return async (): Promise<TradeablePoolInterface> => {
      const poolConfig = poolConfigs[poolId];
      if (!poolConfig) {
        throw new Error(PoolError.DOES_NOT_EXIST);
      }

      const { tokenAAmount, tokenBAmount } = await fetchPoolAmounts(
        connection,
        poolConfig,
        programIds,
        tokenConfigs,
      );

      if (poolConfig.curveType === CurveType.ConstantProduct) {
        return new ConstantProductPool(poolConfig, tokenAAmount, tokenBAmount);
      } else if (poolConfig.curveType === CurveType.Stable) {
        return new StablePool(poolConfig, tokenAAmount, tokenBAmount);
      }

      throw new Error(PoolError.UNSUPPORTED_TYPE);
    };
  }

  function useAsyncPool(poolId: string, maxAge: number = DEFAULT_MAX_AGE) {
    return poolCache.useAsync(poolId, createPoolAsyncFn(poolId), maxAge);
  }

  function useAsyncBatchedPools(
    poolIds: string[],
    maxAge: number = DEFAULT_MAX_AGE,
  ): AsyncResult<TradeablePoolsMap> {
    const keyPairs: [string, () => Promise<TradeablePoolInterface>][] = poolIds.map((poolId) => [
      poolId,
      createPoolAsyncFn(poolId),
    ]);
    return poolCache.useBatchedAsync(keyPairs, maxAge);
  }

  return {
    fetchPool,
    fetchPoolsForTokenPair,
    useAsyncPool,
    useAsyncBatchedPools,
  };
};

export const { Provider: PoolsProvider, useContainer: usePools } =
  createContainer(usePoolsInternal);
