import type { IReactionDisposer } from 'mobx';
import { reaction } from 'mobx';

import type { PricesService } from 'new/services/PriceAPIs/PricesService';

import type { HistoryRefreshTrigger } from './History.RefreshTrigger';

/// Updating price if exchange rate was change
export class PriceRefreshTrigger implements HistoryRefreshTrigger {
  private _pricesService: PricesService;

  constructor({ pricesService }: { pricesService: PricesService }) {
    this._pricesService = pricesService;
  }

  register(cb: () => void): IReactionDisposer {
    return reaction(() => this._pricesService.currentPrices.value, cb);
  }
}
