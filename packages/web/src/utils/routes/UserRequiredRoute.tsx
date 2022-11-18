import type { FunctionComponent } from 'react';
import type { RouteProps } from 'react-router-dom';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { RootViewModel } from 'new/scenes/Root/Root.ViewModel';

export const ProtectedRoute: FunctionComponent<
  {
    allow: boolean;
    redirect: string;
  } & RouteProps
> = ({ allow, redirect }) => {
  const location = useLocation();

  if (!allow) {
    return (
      <Navigate
        to={redirect}
        state={{ fromPage: location.pathname !== '/' ? location.pathname : undefined }}
      />
    );
  }

  return <Outlet />;
};

// ProtectedRoute is used to create specific types.ts of protected routes like this...
export const AuthRequiredRoute: FunctionComponent = () => {
  const rootViewModel = useViewModel(RootViewModel);

  return <ProtectedRoute allow={rootViewModel.walletModel.connected} redirect="/login" />;
};
