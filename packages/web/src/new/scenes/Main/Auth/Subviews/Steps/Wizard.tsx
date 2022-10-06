import type { FC } from 'react';

import { CommonLayout } from 'new/scenes/Main/Auth/Subviews/components/CommonLayout';
import { ConfirmMnemonic } from 'new/scenes/Main/Auth/Subviews/components/ConfirmMnemonic';
import { Mnemonic } from 'new/scenes/Main/Auth/Subviews/components/MnemonicInput';
import { Password } from 'new/scenes/Main/Auth/Subviews/components/Password';
import type { ViewMap } from 'new/scenes/Main/Auth/typings';
import { WizardSteps } from 'new/scenes/Main/Auth/typings';

export interface Props {
  step: WizardSteps;
}

export const Wizard: FC<Props> = (props) => {
  const VIEW_MAP: ViewMap = {
    [WizardSteps.CREATE_START]: (
      <CommonLayout>
        <Mnemonic />
      </CommonLayout>
    ),
    [WizardSteps.CREATE_CONFIRM_MNEMONIC]: (
      <CommonLayout>
        <ConfirmMnemonic />
      </CommonLayout>
    ),
    [WizardSteps.CREATE_SET_PASSWORD]: (
      <CommonLayout>
        <Password />
      </CommonLayout>
    ),
    [WizardSteps.RESTORE_START]: <p>slkdf</p>,
  };

  const elView = VIEW_MAP[props.step];

  return <>{elView}</>;
};

export default Wizard;
