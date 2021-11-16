import { complement, isNil, memoizeWith, mergeAll, splitEvery, toString } from 'ramda';
import assert from 'ts-invariant';

import tokenList from 'api/token/token.config';
import type { NetworkType } from 'config/constants';
import { cryptoCompareApiKey } from 'config/constants';

import type { CandleLimitType } from './CandleRate';
import { CandleRate } from './CandleRate';
import { MarketRate } from './MarketRate';

const CRYPTO_COMPARE_API_URL = 'https://min-api.cryptocompare.com/data';
const CURRENCY = 'USD';

type OrderbooksResponse = {
  [market: string]: {
    [currency: string]: number;
  };
};

type CandlesResponse = {
  Data: {
    Data: {
      close: number;
      open: number;
      low: number;
      high: number;
      time: number;
    }[];
  };
};

const getRatesCandle = async (symbol: string, type: CandleLimitType): Promise<CandleRate[]> => {
  let path = '/v2';

  // eslint-disable-next-line default-case
  switch (type) {
    case 'last1h':
      path += '/histominute?limit=60';
      break;
    case 'last4h':
      path += '/histominute?limit=240';
      break;
    case 'day':
      path += '/histohour?limit=24';
      break;
    case 'week':
      path += '/histoday?limit=7';
      break;
    case 'month':
      path += '/histoday?limit=30';
      break;
  }

  try {
    const res = await fetch(
      `${CRYPTO_COMPARE_API_URL}${path}&api_key=${cryptoCompareApiKey}&fsym=${symbol}&tsym=${CURRENCY}`,
    );

    if (!res.ok) {
      throw new Error('getRatesCandle something wrong');
    }

    const result = (await res.json()) as CandlesResponse;

    return result.Data.Data.map(
      (rate) => new CandleRate(symbol, type, rate.close, rate.time * 1000),
    );
  } catch (error) {
    console.error(`Can't get rates for ${symbol}:`, error);
    throw new Error(`Can't get rates for ${symbol}`);
  }
};

export interface API {
  getRatesMarkets: () => Promise<MarketRate[]>;
  getRatesCandle: (symbol: string, type: CandleLimitType) => Promise<CandleRate[]>;
}

// The API is a singleton per cluster. This ensures requests can be cached
export const APIFactory = memoizeWith(toString, (network: NetworkType): API => {
  assert(cryptoCompareApiKey, 'Define crypto compare api key in .env');

  const tokenSymbols =
    tokenList
      .filterByClusterSlug(network.cluster)
      .excludeByTag('lp-token')
      .excludeByTag('nft')
      .excludeByTag('leveraged')
      .excludeByTag('bull')
      .excludeByTag('wormhole')
      .getList()
      .map((token) => token.symbol.toUpperCase()) || [];

  const getRatesMarkets = async (): Promise<Array<MarketRate>> => {
    try {
      if (network.cluster !== 'mainnet-beta') {
        tokenSymbols.push('RENBTC');
      }
      const chunks = splitEvery(50, tokenSymbols);

      const results = await Promise.all(
        chunks.map(async (chunk) => {
          const res = await fetch(
            `${CRYPTO_COMPARE_API_URL}/pricemulti?api_key=${cryptoCompareApiKey}&fsyms=${chunk.join(
              ',',
            )}&tsyms=${CURRENCY}`,
          );

          if (!res.ok) {
            throw new Error('getRatesMarkets something wrong');
          }

          return (await res.json()) as OrderbooksResponse;
        }),
      );

      const result = mergeAll(results);

      const rates = tokenSymbols.map((symbol) =>
        result[symbol] ? new MarketRate(symbol, result[symbol][CURRENCY]) : null,
      );

      return rates.filter(complement(isNil)) as MarketRate[];
    } catch (error) {
      console.error(`Can't get rates for tokens:`, error);
      throw error;
    }
  };

  return {
    getRatesMarkets,
    getRatesCandle,
  };
});
