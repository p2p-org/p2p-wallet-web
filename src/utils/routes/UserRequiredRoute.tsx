import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { RouteProps } from 'react-router';
import { Redirect, Route, useLocation } from 'react-router-dom';

import { RootState } from 'store/types';

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

  return <Redirect to={redirect} from={location.pathname} />;
};

// ProtectedRoute is used to create specific types of protected routes like this...
export const AuthRequiredRoute: FunctionComponent<RouteProps> = ({ children, ...props }) => {
  const account = useSelector((state: RootState) => state.data.blockchain.account);
  return <ProtectedRoute allow={!!account} redirect="/" {...props} />;
};
