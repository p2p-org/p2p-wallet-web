import type { FC } from 'react';
import { Redirect } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { RootViewModel } from 'new/scenes/Root/Root.ViewModel';

import { AuthViewModel } from './Auth.ViewModel';
import { Wizard } from './Subviews/Wizard';

export const Auth: FC = observer(() => {
  const viewModel = useViewModel(AuthViewModel);
  const rootViewModel = useViewModel(RootViewModel);

  if (rootViewModel.walletModel.connected) {
    return <Redirect to={'/wallets'} />;
  }

  return <Wizard step={viewModel.step} />;
});
