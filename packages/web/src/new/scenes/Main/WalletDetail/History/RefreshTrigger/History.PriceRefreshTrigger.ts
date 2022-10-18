import type { IReactionDisposer } from 'mobx';
import { reaction } from 'mobx';
import { injectable } from 'tsyringe';

import { PricesService } from 'new/services/PriceAPIs/PricesService';

import type { HistoryRefreshTrigger } from './History.RefreshTrigger';

/// Updating price if exchange rate was change
@injectable()
export class PriceRefreshTrigger implements HistoryRefreshTrigger {
  constructor(private _pricesService: PricesService) {}

  register(cb: () => void): IReactionDisposer {
    return reaction(() => this._pricesService.currentPrices.value, cb);
  }
}
