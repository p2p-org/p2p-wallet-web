import type { FC } from 'react';
import { useHistory } from 'react-router';
import { useLocation } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import type { ViewMap, ViewModelProps } from '../typings';
import { WizardSteps } from '../typings';
import { CommonLayout } from './components/CommonLayout';
import { Finalyse } from './components/Finalyse';
import { Password } from './components/Password';
import { ConfirmMnemonicPage } from './Create/ConfirmMnemonicPage';
import { MnemonicArea } from './Create/MnemonicInput';
import { DerivableAccounts } from './Restore/DerivableAccounts';
import { RestoreOptions } from './Restore/RestoreOptions';

export const Wizard: FC<ViewModelProps> = observer(({ authViewModel }) => {
  const location = useLocation();
  const history = useHistory();

  // @FIXME remove and replace with react-router
  if (location.search === '?restore') {
    authViewModel.setRestoreStart();
    history.replace({});
  }

  if (location.search === '?create') {
    authViewModel.setCreateStart();
    history.replace({});
  }

  const VIEW_MAP: ViewMap = {
    [WizardSteps.CREATE_START]: (
      <CommonLayout authViewModel={authViewModel}>
        <MnemonicArea authViewModel={authViewModel} />
      </CommonLayout>
    ),
    [WizardSteps.CREATE_CONFIRM_MNEMONIC]: (
      <CommonLayout authViewModel={authViewModel}>
        <ConfirmMnemonicPage authViewModel={authViewModel} />
      </CommonLayout>
    ),
    [WizardSteps.CREATE_SET_PASSWORD]: (
      <CommonLayout authViewModel={authViewModel}>
        <Password authViewModel={authViewModel} />
      </CommonLayout>
    ),
    [WizardSteps.RESTORE_START]: (
      <CommonLayout authViewModel={authViewModel}>
        <RestoreOptions authViewModel={authViewModel} />
      </CommonLayout>
    ),
    [WizardSteps.RESTORE_PASSWORD]: (
      <CommonLayout authViewModel={authViewModel}>
        <Password authViewModel={authViewModel} />
      </CommonLayout>
    ),
    [WizardSteps.RESTORE_ACCOUNTS]: (
      <CommonLayout authViewModel={authViewModel}>
        <DerivableAccounts authViewModel={authViewModel} />
      </CommonLayout>
    ),
    [WizardSteps.FINAL]: (
      <CommonLayout authViewModel={authViewModel} showNavigation={false}>
        <Finalyse authViewModel={authViewModel} />
      </CommonLayout>
    ),
  };

  return VIEW_MAP[authViewModel.step];
});

export default Wizard;
