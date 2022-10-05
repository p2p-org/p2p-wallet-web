import type { ReactElement } from 'react';

export enum WizardSteps {
  CREATE_START = 'CREATE_START',
  RESTORE_START = 'RESTORE_START',
}

export type AuthInfoVal = string | null;
export type AuthInfo = {
  type: AuthInfoVal;
  mnemonic: AuthInfoVal;
  seed: AuthInfoVal;
  derivationPath: AuthInfoVal;
  password: AuthInfoVal;
};

export type AuthState = {
  step: WizardSteps;
  authInfo: AuthInfo;
};

export type ViewMap = {
  [K in WizardSteps]: ReactElement;
};
