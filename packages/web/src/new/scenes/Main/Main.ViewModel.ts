import { container, injectable } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { FeatureFlags } from 'new/services/FetureFlags';
import { PricesService } from 'new/services/PriceAPIs/PricesService';

@injectable()
export class MainViewModel extends ViewModel {
  constructor(private _pricesService: PricesService) {
    super();

    container.resolve<FeatureFlags>(FeatureFlags); // for creating service instance on app's startup
  }

  protected override onInitialize() {
    this._pricesService.startObserving();
  }

  protected override afterReactionsRemoved() {
    this._pricesService.stopObserving();
  }
}
