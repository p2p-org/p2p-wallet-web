import type { FC } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels';

import { AuthViewModel } from './Auth.ViewModel';
import { Wizard } from './Subviews/Wizard';

type RedirectState = {
  fromPage: string;
};
export const Auth: FC = observer(() => {
  const authViewModel = useViewModel(AuthViewModel);
  const location = useLocation();
  const fromPage = (location.state as RedirectState)?.fromPage || '/wallets';

  if (authViewModel.connected) {
    return <Navigate to={fromPage} />;
  }

  return <Wizard authViewModel={authViewModel} />;
});
