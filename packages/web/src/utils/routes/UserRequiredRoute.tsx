import type { FunctionComponent } from 'react';
import React from 'react';
import { useSelector } from 'react-redux';
import type { RouteProps } from 'react-router';
import { Redirect, Route, useLocation } from 'react-router-dom';

import type { RootState } from 'store/rootReducer';

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
        state: { from: location.pathname !== '/' ? location.pathname : undefined },
      }}
      from={location.pathname}
    />
  );
};

// ProtectedRoute is used to create specific types of protected routes like this...
export const AuthRequiredRoute: FunctionComponent<RouteProps> = ({ children, ...props }) => {
  const connected = useSelector((state: RootState) => state.wallet.connected);
  return <ProtectedRoute allow={!!connected} redirect="/login" {...props} />;
};
