import type { ReactElement } from 'react';

import type { AccountInfo, Connection } from '@solana/web3.js';

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
  seed: string;
  derivationPath: string;
  password: string;
};

export type DerivableAccounts = Array<AccountInfo<Buffer> | null>;

export type AuthState = {
  step: WizardSteps;
  authInfo: AuthInfo;
  connection: Connection;
  derivableAccounts: DerivableAccounts;
  isLoading: boolean;
};

export type ViewMap = {
  [K in WizardSteps]: ReactElement;
};
