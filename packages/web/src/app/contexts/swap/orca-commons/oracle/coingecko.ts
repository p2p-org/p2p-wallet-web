import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';

import coingeckoIds from '../data/json/coingeckoIds.json';
import type { TokenPrices } from '../types';

type CoinConfig = {
  [symbol: string]: string;
};

const coinIds: CoinConfig = coingeckoIds;
const baseURL = 'https://api.coingecko.com/api/v3';
const getPricePartialPath = '/simple/price';

const request = axios.create({ baseURL });

function getPriceRequest(coinIdsJoined: string): AxiosRequestConfig {
  return {
    url: getPricePartialPath,
    method: 'get',
    params: { ids: coinIdsJoined, vs_currencies: 'usd' },
  };
}

export async function getPrices(...tokenNames: string[]): Promise<TokenPrices> {
  try {
    const selectedCoinIds = tokenNames.map((tokenName) => {
      return coinIds[tokenName];
    });
    const coinIdsJoined = selectedCoinIds.join(',');

    const result = await request.request(getPriceRequest(coinIdsJoined));

    const prices: TokenPrices = {};
    tokenNames.forEach(function (tokenName) {
      const coinId = coinIds[tokenName];
      const price = result.data[coinId]?.usd;
      if (price) {
        prices[tokenName] = price;
      }
    });

    return prices;
  } catch (err) {
    throw Error('CoinGecko error - ' + err);
  }
}
