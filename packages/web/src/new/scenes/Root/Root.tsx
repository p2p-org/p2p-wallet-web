import type { FC } from 'react';
import React from 'react';
import { Redirect, useLocation } from 'react-router-dom';

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
    return (
      <Redirect
        to={{
          pathname: '/onboard',
          state: { fromPage: location.pathname },
        }}
      />
    );
  }

  return <>{children}</>;
});
