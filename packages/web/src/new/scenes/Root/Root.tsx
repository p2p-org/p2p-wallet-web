import type { FC } from 'react';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels/useViewModel';

import { RootViewModel } from './Root.ViewModel';

interface Props {
  children: React.ReactNode;
}

export const Root: FC<Props> = observer(({ children }) => {
  const rootViewModel = useViewModel(RootViewModel);
  const location = useLocation();
  const isAuth = location.pathname === '/' || location.pathname === '/onboard';

  if (!rootViewModel.walletModel.connected && !isAuth) {
    return <Navigate to="/onboard" state={{ fromPage: location.pathname }} />;
  }

  return <>{children}</>;
});
