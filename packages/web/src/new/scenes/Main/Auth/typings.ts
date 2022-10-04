import type { ReactElement } from 'react';

export enum WizardSteps {
  CHOOSE_FLOW = 'CHOOSE_FLOW',
}

export type WizardPayload = {
  step: WizardSteps;
};

export type ViewMap = {
  [K in WizardSteps]: ReactElement;
};
