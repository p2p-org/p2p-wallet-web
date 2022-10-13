import type { FC } from 'react';

import { observer } from 'mobx-react-lite';

import type { ViewMap } from '../typings';
import { WizardSteps } from '../typings';
import { CommonLayout } from './components/CommonLayout';
import { Final } from './components/Final';
import { Password } from './components/Password';
import { ConfirmMnemonic } from './Create/ConfirmMnemonic';
import { Mnemonic } from './Create/MnemonicInput';
import { DerivableAccounts } from './Restore/DerivableAccounts';
import { RestoreOptions } from './Restore/RestoreOptions';

export interface Props {
  step: WizardSteps;
}

export const Wizard: FC<Props> = observer((props) => {
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
    [WizardSteps.FINAL]: (
      <CommonLayout>
        <p>FINAL</p>
      </CommonLayout>
    ),
    [WizardSteps.RESTORE_START]: (
      <CommonLayout>
        <RestoreOptions />
      </CommonLayout>
    ),
    [WizardSteps.RESTORE_PASSWORD]: (
      <CommonLayout>
        <Password />
      </CommonLayout>
    ),
    [WizardSteps.RESTORE_ACCOUNTS]: (
      <CommonLayout>
        <DerivableAccounts />
      </CommonLayout>
    ),
    [WizardSteps.FINAL]: (
      <CommonLayout showNavigation={false}>
        <Final />
      </CommonLayout>
    ),
  };

  const elView = VIEW_MAP[props.step];

  return elView;
});

export default Wizard;
