import { singleton } from 'tsyringe';

import type { CurrentPrice } from 'new/services/PriceAPIs/PricesService';
import { PricesFetcher } from 'new/services/PriceAPIs/PricesService';

@singleton()
export class CoingeckoPricesFetcher extends PricesFetcher {
  endpoint = 'https://api.coingecko.com/api/v3';
  // apiKey = '';

  // TODO: check coingecko api ids limit
  // TODO: check get request size limit
  override getCurrentPrices({
    coins,
    toFiat,
  }: {
    coins: string[];
    toFiat: string;
  }): Promise<{ [key in string]: CurrentPrice | null }> {
    const path = '/simple/price?';

    const coinListQuery = coins.join(',');

    return this.send<{ [coingeckoId in string]: { [fiat in string]: number } }>({
      path: `${path}ids=${coinListQuery}&vs_currencies=${toFiat}`,
    }).then((dict) => {
      const result: { [key in string]: CurrentPrice | null } = {};
      for (const key of Object.keys(dict)) {
        let price: CurrentPrice | null = null;
        const value = dict[key]?.[toFiat];
        if (value) {
          price = { value };
        }
        result[key] = price;
      }
      return result;
    });
  }
}
