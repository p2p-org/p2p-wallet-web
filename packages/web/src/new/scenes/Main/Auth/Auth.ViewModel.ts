import * as bip39 from 'bip39';
import { action, computed, makeObservable, observable, reaction, when } from 'mobx';
import { singleton } from 'tsyringe';

import { isDev, localMnemonic } from 'config/constants';
import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { WalletModel } from 'new/models/WalletModel';
import { trackEvent } from 'new/sdk/Analytics';

import { MnemonicAdapter, MnemonicAdapterName } from './MnemonicAdapter';
import { WalletsListViewModel } from './Subviews/Wallets.ViewModel';
import type { AuthInfo, AuthState, DerivationPathOption } from './typings';
import { WizardSteps } from './typings';
import { DERIVATION_PATH, mnemonicToSeed } from './utils';

const createList = [
  WizardSteps.CREATE_START,
  WizardSteps.CREATE_CONFIRM_MNEMONIC,
  WizardSteps.CREATE_SET_PASSWORD,
];
const restoreList = [
  WizardSteps.RESTORE_START,
  WizardSteps.RESTORE_PASSWORD,
  WizardSteps.RESTORE_ACCOUNTS,
];

@singleton()
export class AuthViewModel extends ViewModel {
  step: WizardSteps;
  authInfo: AuthInfo;
  initialCreateMnemonic: string;
  initialRestoreMnemonic: string;

  static defaultState: AuthState = {
    step: WizardSteps.RESTORE_START,
    initialCreateMnemonic: bip39.generateMnemonic(MnemonicAdapter.mnemonicStrength),
    initialRestoreMnemonic: isDev ? (localMnemonic as string) : '',
    authInfo: observable<AuthInfo>({
      mnemonic: localMnemonic as string,
      derivationPath: {
        label: `m/44'/501'/0'/0'`,
        value: DERIVATION_PATH.Bip44Change,
      },
      password: '',
    }),
  };

  constructor(
    public walletListsViewModel: WalletsListViewModel,
    private _walletModel: WalletModel,
  ) {
    super();

    this.step = AuthViewModel.defaultState.step;
    this.authInfo = AuthViewModel.defaultState.authInfo;
    this.initialCreateMnemonic = AuthViewModel.defaultState.initialCreateMnemonic;
    this.initialRestoreMnemonic = AuthViewModel.defaultState.initialRestoreMnemonic;

    makeObservable(this, {
      step: observable,
      authInfo: observable,
      isRestore: computed,
      isCreate: computed,
      showBackButton: computed,
      seed: computed,
      connecting: computed,
      connected: computed,
      setCreateStart: action.bound,
      setRestoreStart: action.bound,
      previousStep: action.bound,
      nextStep: action.bound,
      setPassword: action.bound,
      setDerivationPath: action.bound,
    });
  }

  protected override onInitialize(): void {
    this.walletListsViewModel.initialize();

    this.addReaction(
      reaction(
        () => this.authInfo.derivationPath.value,
        async () => this._fetchWallets(),
      ),
    );
    this.addReaction(
      when(
        () => this.step === WizardSteps.RESTORE_ACCOUNTS,
        async () => this._fetchWallets(),
      ),
    );
  }

  protected override afterReactionsRemoved() {
    this.walletListsViewModel.end();
  }

  protected override setDefaults(): void {
    this.step = AuthViewModel.defaultState.step;
    this.authInfo = AuthViewModel.defaultState.authInfo;
    this.initialCreateMnemonic = AuthViewModel.defaultState.initialCreateMnemonic;
    this.initialRestoreMnemonic = AuthViewModel.defaultState.initialRestoreMnemonic;
  }

  setCreateStart(): void {
    trackEvent({ name: 'Create_Start_Button' });

    this.step = WizardSteps.CREATE_START;
  }

  setRestoreStart(): void {
    trackEvent({ name: 'Restore_Start_Button' });

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

  async finalize(saveLocally: boolean): Promise<void> {
    const seed = await this.seed;

    const storageInfo = {
      mnemonic: this.authInfo.mnemonic,
      password: this.authInfo.password,
      seed,
    };

    await this._walletModel.connectAdaptor(MnemonicAdapterName, {
      type: 'sign',
      derivationPath: this.authInfo.derivationPath.value,
      storageInfo,
      saveLocally,
    });
  }

  async connectExtension(adaptorName: string) {
    await this._walletModel.connectAdaptor(adaptorName);
  }

  setMnemonic(value: string): void {
    this.authInfo.mnemonic = value;
  }

  setDerivationPath(value: DerivationPathOption): void {
    this.authInfo.derivationPath = value;
  }

  get seed(): Promise<string> {
    return mnemonicToSeed(this.authInfo.mnemonic);
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

  get connecting(): boolean {
    return this._walletModel.connecting;
  }

  get connected(): boolean {
    return this._walletModel.connected;
  }

  private _getList(): Array<WizardSteps> {
    return this.isCreate ? createList : restoreList;
  }

  private _getCurrent(): number {
    const list = this._getList();

    return list.indexOf(this.step);
  }

  private async _fetchWallets() {
    this.walletListsViewModel.fetchWallets({
      seed: await this.seed,
      derivationPathValue: this.authInfo.derivationPath.value,
    });
  }
}
