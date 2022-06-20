import { injectable } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { PricesService } from 'new/services/PriceAPIs/PricesService';

@injectable()
export class MainViewModel extends ViewModel {
  constructor(private _pricesService: PricesService) {
    super();
  }

  protected override onInitialize() {
    this._pricesService.startObserving();
  }

  protected override afterReactionsRemoved() {
    this._pricesService.stopObserving();
  }
}
