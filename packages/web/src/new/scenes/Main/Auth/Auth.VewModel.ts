import { DERIVATION_PATH } from '@p2p-wallet-web/core';
import * as bip39 from 'bip39';
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { singleton } from 'tsyringe';

import { isDev, localMnemonic } from 'config/constants';
import { ViewModel } from 'new/core/viewmodels/ViewModel';

import type { AuthInfo, AuthState } from './typings';
import { WizardSteps } from './typings';
import { generateEncryptedTextAsync, mnemonicToSeed, setStorageValue } from './utils';

const createList = [
  WizardSteps.CREATE_START,
  WizardSteps.CREATE_CONFIRM_MNEMONIC,
  WizardSteps.CREATE_SET_PASSWORD,
];
const restoreList = [WizardSteps.RESTORE_START, WizardSteps.RESTORE_PASSWORD];

// @TODO all components in observer
// @FIXME implement browser history with steps
// @TODO how does those methods work (override)?

@singleton()
export class AuthVewModel extends ViewModel {
  step: WizardSteps;
  authInfo: AuthInfo;
  isLoading: boolean;

  private static _mnemonicStrength = 256;
  private static _storageKey = 'encryptedSeedAndMnemonic';

  static defaultState: AuthState = {
    step: WizardSteps.CREATE_START,
    isLoading: false,
    authInfo: observable<AuthInfo>({
      mnemonic: '',
      seed: '',
      derivationPath: DERIVATION_PATH.Bip44Change,
      password: '',
    }),
  };

  constructor() {
    super();

    this.step = AuthVewModel.defaultState.step;
    this.authInfo = AuthVewModel.defaultState.authInfo;
    this.isLoading = AuthVewModel.defaultState.isLoading;

    makeObservable(this, {
      step: observable,
      authInfo: observable,
      isLoading: observable,
      isRestore: computed,
      isCreate: computed,
      showBackButton: computed,
      setCreateStart: action.bound,
      setRestoreStart: action.bound,
      previousStep: action.bound,
      nextStep: action.bound,
      setPassword: action.bound,
      setIsLoading: action.bound,
    });
  }

  protected override afterReactionsRemoved() {
    // @TODO
  }

  protected override async onInitialize(): Promise<void> {
    const mnemonic = this._getMnemonic();
    const seed = await mnemonicToSeed(mnemonic);

    runInAction(() => {
      this.authInfo.seed = seed;
      this.authInfo.mnemonic = mnemonic;
    });
  }

  protected override setDefaults(): void {
    this.step = AuthVewModel.defaultState.step;
    this.authInfo = AuthVewModel.defaultState.authInfo;
    this.isLoading = AuthVewModel.defaultState.isLoading;
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

  setIsLoading(value: boolean): void {
    this.isLoading = value;
  }

  // @TODO do we need another sdk for this logic and utils?
  async saveEncryptedMnemonicAndSeed() {
    const plaintext = JSON.stringify({
      mnemonic: this.authInfo.mnemonic,
      seed: this.authInfo.seed,
    });
    const locked = await generateEncryptedTextAsync(plaintext, this.authInfo.password);

    setStorageValue(AuthVewModel._storageKey, JSON.stringify(locked));
  }

  get isRestore(): boolean {
    return this.step.startsWith('RESTORE');
  }

  get isCreate(): boolean {
    return this.step.startsWith('CREATE');
  }

  get showBackButton(): boolean {
    return this.step !== WizardSteps.CREATE_START && this.step !== WizardSteps.RESTORE_START;
  }

  private _getList(): Array<WizardSteps> {
    return this.isCreate ? createList : restoreList;
  }

  // @TODO reset on flow change

  private _getCurrent(): number {
    const list = this._getList();

    return list.indexOf(this.step);
  }

  private _getMnemonic(): string {
    switch (true) {
      case this.isCreate: {
        return bip39.generateMnemonic(AuthVewModel._mnemonicStrength);
      }
      case this.isRestore && isDev: {
        return localMnemonic as string;
      }
      default:
        return '';
    }
  }
}
