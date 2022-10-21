import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { WalletModel } from 'new/models/WalletModel';
import { LocationService } from 'new/services/LocationService';
import { PricesService } from 'new/services/PriceAPIs/PricesService';

@singleton()
export class RootViewModel extends ViewModel {
  constructor(
    private _pricesService: PricesService,
    public walletModel: WalletModel,
    public locationService: LocationService,
  ) {
    super();
  }

  protected override setDefaults() {}

  protected override onInitialize() {
    this._pricesService.startObserving();
    this.walletModel.initialize();
  }

  protected override afterReactionsRemoved() {
    this._pricesService.stopObserving();
  }
}
