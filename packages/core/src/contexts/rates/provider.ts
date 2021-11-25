import { useCallback, useEffect, useMemo, useState } from 'react';

import type { TokenInfo } from '@solana/spl-token-registry';
import { mergeAll, splitEvery } from 'ramda';
import assert from 'ts-invariant';
import { createContainer } from 'unstated-next';

import { useConnection } from '../solana/connection';
import { useTokenMetas } from '../solana/tokenMetas';
import { BASE_CURRENCY, CRYPTO_COMPARE_API_URL } from './constants';
import type {
  CandleLimitType,
  CandleRate,
  Candles,
  CandlesCryptoCompareResponse,
  Markets,
  OrderbooksCryptoCompareResponse,
} from './types';

const CRYPTO_COMPARE_API_KEY = process.env.REACT_APP_CRYPTO_COMPARE_API_KEY;

const GET_RATES_CANDLE_PATH_ADD = {
  last1h: '/histominute?limit=60',
  last4h: '/histominute?limit=240',
  day: '/histohour?limit=24',
  week: '/histoday?limit=7',
  month: '/histoday?limit=30',
};

export interface UseRates {
  candlesType: CandleLimitType;
  changeCandlesType: (type: CandleLimitType) => void;
  getRatesCandle: (symbol: string, type: CandleLimitType) => Promise<void>;
  candles: Candles;
  markets: Markets;
}

export interface UseRatesArgs {}

const useRatesInternal = (props: UseRatesArgs): UseRates => {
  assert(CRYPTO_COMPARE_API_KEY, 'Define crypto compare api key in .env');

  const { cluster } = useConnection();
  const { tokenList } = useTokenMetas();
  const [candlesType, setCandlesType] = useState<CandleLimitType>('month');
  const [candles, setCandles] = useState<Candles>({});
  const [markets, setMarkets] = useState<Markets>({});

  const tokenSymbols = useMemo(() => {
    if (!tokenList) {
      return [];
    }

    return (
      tokenList
        .excludeByTag('lp-token')
        .excludeByTag('nft')
        .excludeByTag('leveraged')
        .excludeByTag('bull')
        .excludeByTag('wormhole')
        .getList()
        .map((token: TokenInfo) => token.symbol.toUpperCase()) || []
    );
  }, [tokenList]);

  const changeCandlesType = useCallback((type: CandleLimitType) => {
    setCandlesType(type);
  }, []);

  const getRatesCandle = useCallback(async (symbol: string, type: CandleLimitType) => {
    const path = `${CRYPTO_COMPARE_API_URL}/v2`
      .concat(GET_RATES_CANDLE_PATH_ADD[type] || '')
      .concat(`&api_key=${CRYPTO_COMPARE_API_KEY}&fsym=${symbol}&tsym=${BASE_CURRENCY}`);

    try {
      const res = await fetch(path);

      if (!res.ok) {
        throw new Error('getRatesCandle something wrong');
      }

      const result = (await res.json()) as CandlesCryptoCompareResponse;

      const _candles = result.Data.Data.map(
        (rate): CandleRate => ({
          price: rate.close,
          startTime: rate.time * 1000,
        }),
      ).sort((a, b) => a.startTime - b.startTime);

      setCandles((state) => ({
        ...state,
        [symbol]: _candles,
      }));
    } catch (error) {
      setCandles((state) => ({
        ...state,
        [symbol]: [],
      }));

      console.error(`Can't get rates for ${symbol}:`, error);
      throw new Error(`Can't get rates for ${symbol}`);
    }
  }, []);

  const getRatesMarkets = useCallback(async () => {
    if (!tokenSymbols.length) {
      return;
    }

    try {
      if (cluster !== 'mainnet-beta') {
        tokenSymbols.push('RENBTC');
      }
      const chunks = splitEvery(50, tokenSymbols);

      const results = await Promise.all(
        chunks.map(async (chunk) => {
          const path = `${CRYPTO_COMPARE_API_URL}/pricemulti`
            .concat(`?api_key=${CRYPTO_COMPARE_API_KEY}`)
            .concat(`&fsyms=${chunk.join(',')}&tsyms=${BASE_CURRENCY}`);

          const res = await fetch(path);

          if (!res.ok) {
            throw new Error('getRatesMarkets something wrong');
          }

          return (await res.json()) as OrderbooksCryptoCompareResponse;
        }),
      );

      const result = mergeAll(results);

      const rates = tokenSymbols.reduce((acc: Markets, symbol: string) => {
        if (result[symbol]?.[BASE_CURRENCY]) {
          acc[symbol] = result[symbol]![BASE_CURRENCY]!;
        }

        return acc;
      }, <Markets>{});

      setMarkets((state) => ({
        ...state,
        ...rates,
      }));
    } catch (error) {
      console.error(`Can't get rates for tokens:`, error);
      throw error;
    }
  }, [cluster, tokenSymbols]);

  useEffect(() => {
    void getRatesCandle('SOL', 'month');
    void getRatesMarkets();
  }, [getRatesCandle, getRatesMarkets]);

  useEffect(() => {
    void getRatesMarkets();
  }, [getRatesMarkets, tokenSymbols]);

  return {
    candlesType,
    changeCandlesType,
    getRatesCandle,
    candles,
    markets,
  };
};

export const { Provider: RatesProvider, useContainer: useRates } =
  createContainer(useRatesInternal);
