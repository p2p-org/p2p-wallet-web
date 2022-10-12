import type { ReactElement, ReactNode } from 'react';

import type { Connection } from '@solana/web3.js';

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
  // seed: string;
  derivationPath: DerivationPathOption;
  password: string;
};

export type AuthState = {
  step: WizardSteps;
  authInfo: AuthInfo;
  connection: Connection;
  isLoading: boolean;
};

export type DerivationPathOption = {
  value: string;
  label: ReactNode;
};

export type ViewMap = {
  [K in WizardSteps]: ReactElement;
};
