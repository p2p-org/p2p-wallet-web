import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { ModalManager } from 'components/common/ModalManager';
import { Access, Create, Dashboard, DashboardOld, Home } from 'pages';
import { establishConnection } from 'store/actions/complex';
import { RootState } from 'store/types';
import { AuthRequiredRoute } from 'utils/routes/UserRequiredRoute';

export const App: React.FC = () => {
  const dispatch = useDispatch();
  const connectionReady = useSelector((state: RootState) => state.data.blockchain.connectionReady);

  useEffect(() => {
    dispatch(establishConnection());
  }, []);

  if (!connectionReady) {
    return null;
  }

  return (
    <>
      <Router basename={process.env.BASENAME || ''}>
        <Switch>
          <Route path="/" component={Home} exact />
          <Route path="/create" component={Create} />
          <Route path="/access" component={Access} />
          <AuthRequiredRoute path="/dashboard" element={<Dashboard />} />
          <AuthRequiredRoute path="/dashboard_old" element={<DashboardOld />} />
        </Switch>
      </Router>
      <ModalManager />
    </>
  );
};
