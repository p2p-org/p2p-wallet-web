import { action, makeObservable, observable } from 'mobx';
import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { WizardPayload } from 'new/scenes/Main/Auth/typings';
import { WizardSteps } from 'new/scenes/Main/Auth/typings';

@singleton()
export class AuthVewModel extends ViewModel {
  step: WizardSteps;
  static defaultState = {
    step: WizardSteps.CHOOSE_FLOW,
  };

  constructor() {
    super();

    this.step = AuthVewModel.defaultState.step;

    makeObservable(this, {
      step: observable,
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
  }

  onWizardChange(payload: WizardPayload) {
    // @TODO
    this.step = payload.step;
    // console.log(payload);
  }
}
