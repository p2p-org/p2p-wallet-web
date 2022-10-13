import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { PricesService } from 'new/services/PriceAPIs/PricesService';

@singleton()
export class RootViewModel extends ViewModel {
  constructor(private _pricesService: PricesService) {
    super();
  }

  protected override setDefaults() {}

  protected override onInitialize() {
    this._pricesService.startObserving();
  }

  protected override afterReactionsRemoved() {
    this._pricesService.stopObserving();
  }
}
