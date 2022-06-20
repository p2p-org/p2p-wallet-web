import { injectable } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';

@injectable()
export class RootViewModel extends ViewModel {
  protected override onInitialize() {}

  protected override afterReactionsRemoved() {}
}
