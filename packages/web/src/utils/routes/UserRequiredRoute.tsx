import type { FunctionComponent } from 'react';
import type { RouteProps } from 'react-router';
import { Redirect, Route, useLocation } from 'react-router-dom';

import { useWallet } from '@p2p-wallet-web/core';

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
  const { connected } = useWallet();
  return <ProtectedRoute allow={connected} redirect="/login" {...props} />;
};
