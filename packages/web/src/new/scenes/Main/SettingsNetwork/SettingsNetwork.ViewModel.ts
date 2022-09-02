import { action, makeObservable } from 'mobx';
import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { APIEndpoint } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import { LocationService } from 'new/services/LocationService';

@singleton()
export class SettingsNetworkViewModel extends ViewModel {
  constructor(private _locationService: LocationService) {
    super();

    makeObservable(this, {
      setAPIEndpoint: action,
    });
  }

  protected override setDefaults() {}

  protected override onInitialize() {}

  protected override afterReactionsRemoved() {}

  setAPIEndpoint(apiEndpoint: APIEndpoint) {
    Defaults.apiEndpoint = apiEndpoint;
    this._locationService.reload();
  }
}
