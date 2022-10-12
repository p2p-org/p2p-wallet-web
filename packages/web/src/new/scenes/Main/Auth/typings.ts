import type { ReactElement, ReactNode } from 'react';

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
  isLoading: boolean;
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
