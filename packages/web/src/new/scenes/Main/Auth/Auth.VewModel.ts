import { action, computed, makeObservable, observable } from 'mobx';
import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { AuthInfo, AuthState } from 'new/scenes/Main/Auth/typings';
import { WizardSteps } from 'new/scenes/Main/Auth/typings';

const createList = [
  WizardSteps.CREATE_START,
  WizardSteps.CREATE_CONFIRM_MNEMONIC,
  WizardSteps.CREATE_SET_PASSWORD,
];
const restoreList = [WizardSteps.RESTORE_START];

@singleton()
export class AuthVewModel extends ViewModel {
  step: WizardSteps;
  authInfo: AuthInfo;

  static defaultState: AuthState = {
    step: WizardSteps.CREATE_START,
    authInfo: observable<AuthInfo>({
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
      setPassword: action.bound,
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

  setCreateStart(): void {
    this.step = WizardSteps.CREATE_START;
  }

  setRestoreStart(): void {
    this.step = WizardSteps.RESTORE_START;
  }

  nextStep(): void {
    const currentIdx = this._getCurrent();
    const list = this._getList();

    switch (true) {
      case currentIdx === list.length - 1: {
        this.step = WizardSteps.FINAL;
        break;
      }
      case currentIdx === -1: {
        this.step = list[0] as WizardSteps;
        break;
      }
      default: {
        this.step = list[currentIdx + 1] as WizardSteps;
      }
    }
  }

  previousStep(): void {
    const currentIdx = this._getCurrent();
    const list = this._getList();

    switch (true) {
      case currentIdx === 0: {
        break;
      }
      case currentIdx === -1: {
        this.step = list[0] as WizardSteps;
        break;
      }
      default: {
        this.step = list[currentIdx - 1] as WizardSteps;
      }
    }
  }

  setPassword(value: string): void {
    this.authInfo.password = value;
  }

  setMnemonic(value: string): void {
    this.authInfo.mnemonic = value;
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
