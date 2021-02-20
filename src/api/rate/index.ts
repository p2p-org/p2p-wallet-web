import { complement, identity, isNil, memoizeWith } from 'ramda';
import assert from 'ts-invariant';

import tokenConfig from 'api/token/token.config';
import { cryptoCompareApiKey } from 'config/constants';
import { ExtendedCluster } from 'utils/types';

import { CandleRate } from './CandleRate';
import { MarketRate } from './MarketRate';

const CRYPTO_COMPARE_API_URL = 'https://min-api.cryptocompare.com/data';

type OrderbooksResponse = {
  [market: string]: {
    [currency: string]: number;
  };
};

type CandlesResponse = {
  data: {
    market: string;
    close: number;
    startTime: number;
  }[];
};

export interface API {
  getRatesMarkets: () => Promise<MarketRate[]>;
  getRatesCandle: (symbol: string) => Promise<CandleRate[]>;
}

const getRatesCandle = async (symbol: string): Promise<CandleRate[]> => {
  try {
    const res = await fetch(
      `https://serum-api.bonfida.com/candles/${symbol}USD?resolution=86400&limit=365`,
    );

    if (!res.ok) {
      throw new Error('Something wrong');
    }

    const result = (await res.json()) as CandlesResponse;

    return result.data.map((rate) => new CandleRate(rate.market, rate.close, rate.startTime));
  } catch (error) {
    console.error(`Can't get rates for ${symbol}:`, error);
    throw new Error(`Can't get rates for ${symbol}`);
  }
};

// The API is a singleton per cluster. This ensures requests can be cached
export const APIFactory = memoizeWith(
  identity,
  (cluster: ExtendedCluster): API => {
    const tokenSymbols = tokenConfig[cluster]?.map((token) => token.tokenSymbol) || [];
    tokenSymbols.push('SOL');

    const getRatesMarkets = async (): Promise<Array<MarketRate>> => {
      assert(cryptoCompareApiKey, 'Define crypto compare api key in .env');

      const CURRENCY = 'USD';

      try {
        const res = await fetch(
          `${CRYPTO_COMPARE_API_URL}/pricemulti?api_key=${cryptoCompareApiKey}&fsyms=${tokenSymbols.join(
            ',',
          )}&tsyms=${CURRENCY}`,
        );

        if (!res.ok) {
          throw new Error('Something wrong');
        }

        const result = (await res.json()) as OrderbooksResponse;

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
  },
);
