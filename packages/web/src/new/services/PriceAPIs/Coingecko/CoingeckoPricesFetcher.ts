import { uniq } from 'ramda';
import { singleton } from 'tsyringe';

import type { Token } from 'new/sdk/SolanaSDK';
import type { CurrentPrice } from 'new/services/PriceAPIs/PricesService';
import { PricesFetcher } from 'new/services/PriceAPIs/PricesService';

type CoinMarketData = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
};

// TODO: look to make it cooler https://github.com/p2p-org/key-app-kit-swift/tree/fb77faab1da1a21b52ad61c9e388535d15a39e98/Sources/SolanaPricesAPIs

@singleton()
export class CoingeckoPricesFetcher extends PricesFetcher {
  endpoint = 'https://api.coingecko.com/api/v3';

  // TODO: check coingecko api ids limit
  // TODO: check get request size limit
  override async getCurrentPrices({
    coins,
    fiat,
  }: {
    coins: Token[];
    fiat: string;
  }): Promise<Record<string, CurrentPrice | null>> {
    const param = uniq(
      coins
        .map((coin) => coin.extensions?.coingeckoId)
        .filter((coingeckoId): coingeckoId is string => !!coingeckoId),
    ).join(',');

    const pricesResult = await this.send<CoinMarketData[]>({
      path: `/coins/markets/?vs_currency=${fiat}&ids=${param}`,
    });

    return pricesResult.reduce((partialResult, data) => {
      partialResult[data.symbol.toUpperCase()] = {
        value: data.current_price,
        change24h: {
          value: data.price_change_24h,
          percentage: data.price_change_percentage_24h,
        },
      };
      return partialResult;
    }, {} as Record<string, CurrentPrice | null>);
  }
}
