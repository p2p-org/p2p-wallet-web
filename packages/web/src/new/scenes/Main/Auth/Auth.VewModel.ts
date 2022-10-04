import { action, makeObservable, observable } from 'mobx';
import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { AuthInfo, AuthState, WizardPayload } from 'new/scenes/Main/Auth/typings';
import { WizardSteps } from 'new/scenes/Main/Auth/typings';

@singleton()
export class AuthVewModel extends ViewModel {
  step: WizardSteps;
  authInfo: AuthInfo;

  static defaultState: AuthState = {
    step: WizardSteps.CHOOSE_FLOW,
    authInfo: observable.object<AuthInfo>({
      type: null,
      mnemonic: null,
      seed: null,
      derivationPath: null,
      password: null,
    }),
  };

  constructor() {
    super();

    this.step = AuthVewModel.defaultState.step;
    this.authInfo = AuthVewModel.defaultState.authInfo;

    makeObservable(this, {
      step: observable,
      authInfo: observable,
      onWizardChange: action.bound,
    });
  }

  protected override afterReactionsRemoved() {
    // @TODO
  }

  protected override onInitialize() {
    // @TODO
  }

  protected override setDefaults() {
    this.step = AuthVewModel.defaultState.step;
    this.authInfo = AuthVewModel.defaultState.authInfo;
  }

  onWizardChange(payload: WizardPayload) {
    // @TODO
    this.step = payload.step;
    // console.log(payload);
  }
}
