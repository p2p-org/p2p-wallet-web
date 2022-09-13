import { Lifecycle, scoped } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';

@scoped(Lifecycle.ResolutionScoped)
export class NetworkViewModel extends ViewModel {
  constructor() {
    super();
  }
}
