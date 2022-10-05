import { action, computed, makeObservable, observable } from 'mobx';
import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { AuthInfo, AuthState } from 'new/scenes/Main/Auth/typings';
import { WizardSteps } from 'new/scenes/Main/Auth/typings';

@singleton()
export class AuthVewModel extends ViewModel {
  step: WizardSteps;
  authInfo: AuthInfo;

  static defaultState: AuthState = {
    step: WizardSteps.CREATE_START,
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
      isRestore: computed,
      isCreate: computed,
      showBackButton: computed,
      setCreateStart: action.bound,
      setRestoreStart: action.bound,
      setStep: action.bound,
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

  setAuthInfo(info: AuthInfo): void {
    this.authInfo = info;
  }

  setCreateStart(): void {
    this.step = WizardSteps.CREATE_START;
  }

  setRestoreStart(): void {
    this.step = WizardSteps.RESTORE_START;
  }

  setStep(step: WizardSteps): void {
    this.step = step;
  }

  get isRestore(): boolean {
    return this.step.startsWith('RESTORE');
  }

  get isCreate(): boolean {
    return this.step.startsWith('CREATE');
  }

  get showBackButton(): boolean {
    return this.step !== WizardSteps.CREATE_START;
  }
}
