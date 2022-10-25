import type { FunctionComponent } from 'react';
import type { RouteProps } from 'react-router';
import { Redirect, Route, useLocation } from 'react-router-dom';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { RootViewModel } from 'new/scenes/Root/Root.ViewModel';

export const ProtectedRoute: FunctionComponent<
  {
    allow: boolean;
    redirect: string;
  } & RouteProps
> = ({ allow, redirect, ...props }) => {
  const location = useLocation();

  if (allow) {
    return <Route {...props} />;
  }

  return (
    <Redirect
      to={{
        pathname: redirect,
        state: { fromPage: location.pathname !== '/' ? location.pathname : undefined },
      }}
      from={location.pathname}
    />
  );
};

// ProtectedRoute is used to create specific types.ts of protected routes like this...
export const AuthRequiredRoute: FunctionComponent<RouteProps> = ({ ...props }) => {
  const rootViewModel = useViewModel(RootViewModel);

  return (
    <ProtectedRoute allow={rootViewModel.walletModel.connected} redirect="/login" {...props} />
  );
};
