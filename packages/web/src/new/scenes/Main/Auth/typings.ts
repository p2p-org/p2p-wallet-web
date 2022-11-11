import type { ReactElement, ReactNode } from 'react';

import type { Signer } from '@solana/web3.js';

import type { AuthViewModel } from './Auth.ViewModel';

export enum WizardSteps {
  CREATE_START = 'CREATE_START',
  CREATE_CONFIRM_MNEMONIC = 'CREATE_CONFIRM_MNEMONIC',
  CREATE_SET_PASSWORD = 'CREATE_SET_PASSWORD',
  RESTORE_START = 'RESTORE_START',
  RESTORE_PASSWORD = 'RESTORE_PASSWORD',
  RESTORE_ACCOUNTS = 'RESTORE_ACCOUNTS',
  FINAL = 'FINAL',
}

export type AuthInfo = {
  mnemonic: string;
  derivationPath: DerivationPathOption;
  password: string;
};

export type AuthState = {
  step: WizardSteps;
  authInfo: AuthInfo;
  initialCreateMnemonic: string;
  initialRestoreMnemonic: string;
};

export type DerivationPathOption = {
  value: string;
  label: ReactNode;
};

export type GetWalletsConfig = {
  seed: string;
  derivationPathValue: string;
};

export type ViewMap = {
  [K in WizardSteps]: ReactElement;
};

export type ConnectConfig = SignInConnectConfig | RecurringConnectConfig;

type SignInConnectConfig = {
  type: 'sign';
  derivationPath: string;
  saveLocally: boolean;
  storageInfo: StorageInfo;
};

type RecurringConnectConfig = {
  type: 'recur';
  signer: Signer;
};

export type StorageInfo = {
  mnemonic: string;
  seed: string;
  password: string;
};

export type ExpiryDataType<T> = {
  value: T;
  expiry: number;
};

export type ViewModelProps = {
  authViewModel: AuthViewModel;
};

export type ValueOf<T> = T[keyof T];
