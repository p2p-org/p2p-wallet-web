import { runInAction } from 'mobx';
import { isEmpty } from 'ramda';
import { singleton } from 'tsyringe';

import { Defaults } from 'new/services/Defaults';

import type { CurrentPrice } from './PricesFetcher';

interface IPricesStorage {
  retrivePrices(): { [key in string]: CurrentPrice };
  savePrices(prices: { [key in string]: CurrentPrice }): void;
}

@singleton()
export class PricesStorage implements IPricesStorage {
  retrivePrices(): { [key in string]: CurrentPrice } {
    let prices: { [key in string]: CurrentPrice } = {};
    const data = Defaults.prices;
    if (!isEmpty(data)) {
      prices = data;
    }
    return prices;
  }

  savePrices(prices: { [key in string]: CurrentPrice }) {
    runInAction(() => {
      Defaults.prices = prices;
    });
  }
}
