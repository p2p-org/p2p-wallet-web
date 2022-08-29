import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';

@singleton()
export class RootViewModel extends ViewModel {
  protected override setDefaults() {}

  protected override onInitialize() {}

  protected override afterReactionsRemoved() {}
}
