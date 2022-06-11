import { injectable } from 'tsyringe';

import { PricesService } from 'new/services/PriceAPIs/PricesService';
import { ViewModel } from 'new/viewmodels/ViewModel';

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
