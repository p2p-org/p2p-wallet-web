import { isEmpty } from 'ramda';
import { singleton } from 'tsyringe';

import type { CurrentPrice } from './PricesFetcher';

interface IPricesStorage {
  retrivePrices(): { [key in string]: CurrentPrice };
  savePrices(prices: { [key in string]: CurrentPrice }): void;
}

@singleton()
export class PricesStorage implements IPricesStorage {
  retrivePrices(): { [key in string]: CurrentPrice } {
    let prices: { [key in string]: CurrentPrice } = {};
    const data = {}; // TODO: Defaults.prices
    if (!isEmpty(data)) {
      prices = data;
    }
    return prices;
  }

  savePrices(_prices: { [key in string]: CurrentPrice }) {
    // TODO: Defaults.prices = prices;
  }
}
