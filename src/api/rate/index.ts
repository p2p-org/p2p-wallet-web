import { complement, identity, isNil, memoizeWith } from 'ramda';

import tokenConfig from 'api/token/token.config';
import { ExtendedCluster } from 'utils/types';

import { Rate } from './Rate';

export interface API {
  getRates: () => Promise<Rate[]>;
}

type OrderbooksResponse = {
  data: {
    market: string;
    bids: { price: number }[];
  };
};

const getRate = async (symbol: string): Promise<Rate> => {
  try {
    const res = await fetch(`https://serum-api.bonfida.com/orderbooks/${symbol}USDT`);

    if (!res.ok) {
      throw new Error('Something wrong');
    }

    const result = (await res.json()) as OrderbooksResponse;

    return new Rate(result.data.market, result.data.bids[0]?.price);
  } catch (error) {
    console.error(`Can't get rates for ${symbol}:`, error);
    throw error;
  }
};

// The API is a singleton per cluster. This ensures requests can be cached
export const APIFactory = memoizeWith(
  identity,
  (cluster: ExtendedCluster): API => {
    const tokenSymbols = tokenConfig[cluster]?.map((token) => token.tokenSymbol) || [];
    tokenSymbols.push('SOL');

    const getRates = async (): Promise<Array<Rate>> => {
      const rates = await Promise.all(
        tokenSymbols.map((symbol) => getRate(symbol).catch((error) => console.error(error))),
      );

      return rates.filter(complement(isNil)) as Rate[];
    };

    return {
      getRates,
    };
  },
);
