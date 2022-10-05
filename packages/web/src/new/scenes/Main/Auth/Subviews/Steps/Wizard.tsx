import type { FC } from 'react';

import type { ViewMap } from 'new/scenes/Main/Auth/typings';
import { WizardSteps } from 'new/scenes/Main/Auth/typings';

import { ConfirmMnemonicStep } from './ConfirmMnemonicStep';
import { CreateMnemonicStep } from './CreateMnemonicStep';

export interface Props {
  step: WizardSteps;
}

export const Wizard: FC<Props> = (props) => {
  const VIEW_MAP: ViewMap = {
    [WizardSteps.CREATE_START]: <CreateMnemonicStep />,
    [WizardSteps.CREATE_CONFIRM_MNEMONIC]: <ConfirmMnemonicStep />,
    [WizardSteps.RESTORE_START]: <p>slkdf</p>,
  };

  const elView = VIEW_MAP[props.step];

  return <>{elView}</>;
};

export default Wizard;
