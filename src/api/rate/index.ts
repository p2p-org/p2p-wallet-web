import { complement, identity, isNil, memoizeWith } from 'ramda';

import tokenConfig from 'api/token/token.config';
import { ExtendedCluster } from 'utils/types';

import { CandleRate } from './CandleRate';
import { MarketRate } from './MarketRate';

type OrderbooksResponse = {
  data: {
    market: string;
    bids: { price: number }[];
  };
};

type CandlesResponse = {
  data: {
    market: string;
    close: number;
    startTime: number;
  }[];
};

const getMarketRate = async (symbol: string): Promise<MarketRate> => {
  try {
    const res = await fetch(`https://serum-api.bonfida.com/orderbooks/${symbol}USDT`);

    if (!res.ok) {
      throw new Error('Something wrong');
    }

    const result = (await res.json()) as OrderbooksResponse;

    return new MarketRate(result.data.market, result.data.bids[0]?.price);
  } catch (error) {
    console.error(`Can't get rates for ${symbol}:`, error);
    throw error;
  }
};

export interface API {
  getMarketsRates: () => Promise<MarketRate[]>;
  getCandleRates: (symbol: string) => Promise<CandleRate[]>;
}

const getCandleRates = async (symbol: string): Promise<CandleRate[]> => {
  try {
    const res = await fetch(
      `https://serum-api.bonfida.com/candles/${symbol}USDT?resolution=86400&limit=365`,
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

    const getMarketsRates = async (): Promise<Array<MarketRate>> => {
      const rates = await Promise.all(
        tokenSymbols.map((symbol) => getMarketRate(symbol).catch((error) => console.error(error))),
      );

      return rates.filter(complement(isNil)) as MarketRate[];
    };

    return {
      getMarketsRates,
      getCandleRates,
    };
  },
);
