import type { FC } from 'react';
import { Redirect, useLocation } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels';

import { AuthViewModel } from './Auth.ViewModel';
import { Wizard } from './Subviews/Wizard';

type RedirectState = {
  redirectTo: string;
};
export const Auth: FC = observer(() => {
  const authViewModel = useViewModel(AuthViewModel);
  const location = useLocation();
  const redirectTo = (location.state as RedirectState)?.redirectTo || '/wallets';

  if (authViewModel.connected) {
    return <Redirect to={redirectTo} />;
  }

  return <Wizard authViewModel={authViewModel} />;
});
