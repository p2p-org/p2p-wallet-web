import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { RouteProps } from 'react-router';
import { Navigate, useLocation } from 'react-router-dom';

import { RootState } from 'store/types';

export const ProtectedRoute: FunctionComponent<{
  element: React.ReactElement;
  children?: React.ReactElement;
  allow: boolean;
  redirect: string;
}> = ({ element, children, allow, redirect }) => {
  const location = useLocation();
  return allow ? (
    element || children
  ) : (
    <Navigate to={redirect} replace state={{ from: location.pathname }} />
  );
};

// ProtectedRoute is used to create specific types of protected routes like this...
export const AuthRequiredRoute: FunctionComponent<
  {
    element: React.ReactElement;
    children?: React.ReactElement;
  } & RouteProps
> = ({ element, children }) => {
  const account = useSelector((state: RootState) => state.data.blockchain.account);
  return (
    <ProtectedRoute allow={!!account} redirect="/" element={element}>
      {children}
    </ProtectedRoute>
  );
};
