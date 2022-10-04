import type { ReactElement } from 'react';

export enum WizardSteps {
  CHOOSE_FLOW = 'CHOOSE_FLOW',
}

export type WizardPayload = {
  step: WizardSteps;
};

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
