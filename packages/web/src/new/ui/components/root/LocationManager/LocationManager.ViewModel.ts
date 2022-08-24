import type { History } from 'history';
import { injectable } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { LocationService } from 'new/services/LocationService';

@injectable()
export class LocationManagerViewModel extends ViewModel {
  constructor(private _locationService: LocationService) {
    super();
  }

  protected override onInitialize() {}

  protected override afterReactionsRemoved() {}

  setHistory(history: History) {
    this._locationService.listenHistory(history);
  }
}
