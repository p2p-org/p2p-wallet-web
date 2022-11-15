import type { Location, NavigateFunction } from 'react-router-dom';

import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { LocationService } from 'new/services/LocationService';

@singleton()
export class LocationManagerViewModel extends ViewModel {
  constructor(private _locationService: LocationService) {
    super();
  }

  protected override setDefaults() {}

  protected override onInitialize() {}

  protected override afterReactionsRemoved() {}

  setLocation(location: Location): void {
    this._locationService.setLocation(location);
  }

  setNavigate(navigate: NavigateFunction): void {
    this._locationService.setNavigate(navigate);
  }
}
