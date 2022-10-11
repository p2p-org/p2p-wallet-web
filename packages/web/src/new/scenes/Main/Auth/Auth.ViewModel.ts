import { u64 } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import * as bip39 from 'bip39';
import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';
import { singleton } from 'tsyringe';

import { isDev, localMnemonic } from 'config/constants';
import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { Wallet } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';

import type { AuthInfo, AuthState, DerivationPathOption } from './typings';
import { WizardSteps } from './typings';
import {
  DERIVATION_PATH,
  derivePublicKeyFromSeed,
  generateEncryptedTextAsync,
  loggable,
  mnemonicToSeed,
  setStorageValue,
} from './utils';

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

// @TODO all components in observer
// @FIXME implement browser history with steps || move back to router
// @TODO how does those methods work (override)?

@singleton()
export class AuthViewModel extends ViewModel {
  step: WizardSteps;
  authInfo: AuthInfo;
  isLoading: boolean;

  private _connection: Connection;

  private static _mnemonicStrength = 256;
  private static _derivebleAccountsNumber = 5;
  private static _storageKey = 'encryptedSeedAndMnemonic';

  static defaultState: AuthState = {
    step: WizardSteps.RESTORE_START,
    isLoading: false,
    connection: new Connection(Defaults.apiEndpoint.getURL()),
    authInfo: observable<AuthInfo>({
      mnemonic: '',
      seed: '',
      derivationPath: {
        label: `m/44'/501'/0'/0'`,
        value: DERIVATION_PATH.Bip44Change,
      },
      password: '',
    }),
  };

  constructor() {
    super();

    this.step = AuthViewModel.defaultState.step;
    this.authInfo = AuthViewModel.defaultState.authInfo;
    this.isLoading = AuthViewModel.defaultState.isLoading;
    this._connection = AuthViewModel.defaultState.connection;

    makeObservable(this, {
      step: observable,
      authInfo: observable,
      isLoading: observable,
      isRestore: computed,
      isCreate: computed,
      showBackButton: computed,
      wallets: computed,
      setCreateStart: action.bound,
      setRestoreStart: action.bound,
      previousStep: action.bound,
      nextStep: action.bound,
      setPassword: action.bound,
      setIsLoading: action.bound,
      setDerivationPath: action.bound,
    });
  }

  protected override afterReactionsRemoved() {
    // @TODO
  }

  @loggable()
  protected override async onInitialize(): Promise<void> {
    const mnemonic = this._getMnemonic();
    const seed = await mnemonicToSeed(mnemonic);

    runInAction(() => {
      this.authInfo.seed = seed;
      this.authInfo.mnemonic = mnemonic;
    });

    this.addReaction(
      reaction(
        () => this.isRestore,
        async () => {
          this.authInfo.mnemonic = this._getMnemonic();
          this.authInfo.seed = await mnemonicToSeed(this.authInfo.mnemonic);
        },
      ),
    );
  }

  protected override setDefaults(): void {
    this.step = AuthViewModel.defaultState.step;
    this.authInfo = AuthViewModel.defaultState.authInfo;
    this.isLoading = AuthViewModel.defaultState.isLoading;
    this._connection = AuthViewModel.defaultState.connection;
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

  setDerivationPath(value: DerivationPathOption): void {
    this.authInfo.derivationPath = value;
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

    setStorageValue(AuthViewModel._storageKey, JSON.stringify(locked));
  }

  get wallets(): Promise<Array<Wallet | null>> {
    const derivableTokenAccountPublicKeys = new Array(AuthViewModel._derivebleAccountsNumber)
      .fill(null)
      .map((_, idx) => {
        const pubKey = derivePublicKeyFromSeed(
          this.authInfo.seed,
          idx,
          this.authInfo.derivationPath.value,
        );
        return new PublicKey(pubKey);
      });

    const wallets = this._connection
      .getMultipleAccountsInfo(derivableTokenAccountPublicKeys)
      .then((accounts) => {
        return accounts.map((acc) => {
          if (acc) {
            return Wallet.nativeSolana({
              lamports: new u64(acc?.lamports),
              pubkey: acc?.owner.toString(),
            });
          }

          return null;
        });
      });

    return wallets;
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

  private _getCurrent(): number {
    const list = this._getList();

    return list.indexOf(this.step);
  }

  private _getMnemonic(): string {
    switch (true) {
      case this.isCreate: {
        return bip39.generateMnemonic(AuthViewModel._mnemonicStrength);
      }
      case this.isRestore && isDev: {
        return localMnemonic as string;
      }
      default:
        return '';
    }
  }
}
