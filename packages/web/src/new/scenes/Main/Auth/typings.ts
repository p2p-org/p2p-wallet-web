import type { ReactElement } from 'react';

export enum WizardSteps {
  CREATE_START = 'CREATE_START',
  CREATE_CONFIRM_MNEMONIC = 'CREATE_CONFIRM_MNEMONIC',
  CREATE_SET_PASSWORD = 'CREATE_SET_PASSWORD',
  RESTORE_START = 'RESTORE_START',
  RESTORE_PASSWORD = 'RESTORE_PASSWORD',
  FINAL = 'FINAL',
}

export type AuthInfo = {
  mnemonic: string;
  seed: string;
  derivationPath: string;
  password: string;
};

export type AuthState = {
  step: WizardSteps;
  authInfo: AuthInfo;
  isLoading: boolean;
};

export type ViewMap = {
  [K in WizardSteps]: ReactElement;
};
