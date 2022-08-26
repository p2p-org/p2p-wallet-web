import type { History } from 'history';
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

  setHistory(history: History): void {
    this._locationService.setHistory(history);
  }
}
