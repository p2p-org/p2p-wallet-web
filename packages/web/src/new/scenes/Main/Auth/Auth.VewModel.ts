import { action, computed, makeObservable, observable } from 'mobx';
import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { AuthInfo, AuthState } from 'new/scenes/Main/Auth/typings';
import { WizardSteps } from 'new/scenes/Main/Auth/typings';

const createList = [WizardSteps.CREATE_START, WizardSteps.CREATE_CONFIRM_MNEMONIC];
const restoreList = [WizardSteps.RESTORE_START];

@singleton()
export class AuthVewModel extends ViewModel {
  step: WizardSteps;
  authInfo: AuthInfo;

  static defaultState: AuthState = {
    step: WizardSteps.CREATE_START,
    authInfo: observable.object<AuthInfo>({
      mnemonic: '',
      seed: '',
      derivationPath: '',
      password: '',
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
      previousStep: action.bound,
      nextStep: action.bound,
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

  nextStep(): WizardSteps | undefined {
    const currentIdx = this._getCurrent();
    const list = this._getList();

    if (currentIdx === list.length - 1) {
      return;
    }

    if (currentIdx === -1) {
      return (this.step = list[0] as WizardSteps);
    }

    return (this.step = list[currentIdx + 1] as WizardSteps);
  }

  previousStep(): WizardSteps | undefined {
    const currentIdx = this._getCurrent();
    const list = this._getList();

    if (currentIdx === 0) {
      return;
    }

    if (currentIdx === -1) {
      return (this.step = list[0] as WizardSteps);
    }

    return (this.step = list[currentIdx - 1] as WizardSteps);
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

  private _getList(): Array<WizardSteps> {
    return this.isCreate ? createList : restoreList;
  }

  private _getCurrent(): number {
    const list = this._getList();

    return list.indexOf(this.step);
  }
}
