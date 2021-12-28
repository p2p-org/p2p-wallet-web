import { useEffect, useState } from 'react';

import Decimal from 'decimal.js';
import { createContainer } from 'unstated-next';

import { getPrices } from 'app/contexts/solana/swap/orca-commons/oracle/coingecko';

import { useConfig } from '../config';
import type { TokenPrices } from '../orca-commons';
import { usePools } from '../pools';
import type { AsyncResult } from '../utils/AsyncCache';
import AsyncCache from '../utils/AsyncCache';

const cache = new AsyncCache<TokenPrices>();

const ALL_PRICES_CACHE_KEY = 'ALL_PRICES';

const ORCASOLPoolName = 'ORCA/USDC[aquafarm]';
const ORCATokenName = 'ORCA';

export interface UsePrice {
  fetchAllPrices: () => Promise<TokenPrices> | undefined;
  useAsyncAllPrices: () => AsyncResult<TokenPrices>;
  useAsyncORCAPrice: () => AsyncResult<number>;
  useAsyncMergedPrices: () => AsyncResult<TokenPrices>;
}

export const usePriceInternal = (): UsePrice => {
  const { tokenConfigs } = useConfig();
  const { useAsyncPool } = usePools();

  function fetchAllPrices() {
    return cache.refreshCache(ALL_PRICES_CACHE_KEY);
  }

  function useAsyncAllPrices() {
    const allTokens = Object.entries(tokenConfigs)
      .filter(([_, data]) => data.fetchPrice)
      .map(([token, _]) => token);
    const asyncFn = () => {
      return getPrices(...allTokens);
    };

    return cache.useAsync(ALL_PRICES_CACHE_KEY, asyncFn);
  }

  function useAsyncORCAPrice(): AsyncResult<number> {
    const asyncORCAUSDCPool = useAsyncPool(ORCASOLPoolName);
    const [priceResult, setPriceResult] = useState<AsyncResult<number>>({
      value: null,
      error: null,
    });

    useEffect(() => {
      if (!asyncORCAUSDCPool.value || asyncORCAUSDCPool.error) {
        setPriceResult(asyncORCAUSDCPool);
        return;
      }

      const tokenAAmount = asyncORCAUSDCPool.value.getTokenAAmount();
      const tokenBAmount = asyncORCAUSDCPool.value.getTokenBAmount();
      setPriceResult({
        value: new Decimal(tokenBAmount.toString()).div(tokenAAmount.toString()).toNumber(),
        error: null,
      });
    }, [asyncORCAUSDCPool]);

    return priceResult;
  }

  function useAsyncMergedPrices(): AsyncResult<TokenPrices> {
    const asyncAllPrices = useAsyncAllPrices();
    const asyncORCAPrice = useAsyncORCAPrice();

    const [pricesResult, setPricesResult] = useState<AsyncResult<TokenPrices>>({
      value: null,
      error: null,
    });

    useEffect(() => {
      if (!asyncAllPrices.value) {
        setPricesResult(asyncAllPrices);
      }

      if (!asyncORCAPrice.value) {
        setPricesResult({ value: null, error: asyncORCAPrice.error });
      }

      setPricesResult({
        value: Object.assign({}, asyncAllPrices.value, {
          [ORCATokenName]: asyncORCAPrice.value,
        }),
        error: null,
      });
    }, [asyncAllPrices, asyncORCAPrice]);

    return pricesResult;
  }

  return {
    fetchAllPrices,
    useAsyncAllPrices,
    useAsyncORCAPrice,
    useAsyncMergedPrices,
  };
};

export const { Provider: PriceProvider, useContainer: usePrice } =
  createContainer(usePriceInternal);
