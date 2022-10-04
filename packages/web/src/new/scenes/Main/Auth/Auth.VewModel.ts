import { makeObservable, observable } from 'mobx';
import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';

@singleton()
export class AuthVewModel extends ViewModel {
  isAuthenticated = true;

  constructor() {
    super();

    makeObservable(this, {
      isAuthenticated: observable,
    });
  }

  protected override afterReactionsRemoved() {
    // @TODO
  }

  protected override onInitialize() {
    // @TODO
  }

  protected override setDefaults() {
    // @TODO why to duplicate
  }
}
