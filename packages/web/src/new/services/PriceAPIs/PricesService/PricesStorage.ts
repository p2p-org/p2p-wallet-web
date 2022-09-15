import { runInAction } from 'mobx';
import { isEmpty } from 'ramda';
import { singleton } from 'tsyringe';

import { Defaults } from 'new/services/Defaults';

import type { CurrentPrice } from './PricesFetcher';

interface IPricesStorage {
  retrivePrices(): Record<string, CurrentPrice>;
  savePrices(prices: Record<string, CurrentPrice>): void;
}

@singleton()
export class PricesStorage implements IPricesStorage {
  retrivePrices(): Record<string, CurrentPrice> {
    let prices: Record<string, CurrentPrice> = {};
    const data = Defaults.prices;
    if (!isEmpty(data)) {
      prices = data;
    }
    return prices;
  }

  savePrices(prices: Record<string, CurrentPrice>) {
    runInAction(() => {
      Defaults.prices = prices;
    });
  }
}
