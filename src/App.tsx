import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import { ModalManager } from 'components/common/ModalManager';
import { Access, Create, DashboardOld, Home, Send, Swap, Wallet, Wallets } from 'pages';
import { establishConnection } from 'store/actions/complex';
import { AuthRequiredRoute } from 'utils/routes/UserRequiredRoute';

export const App: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(establishConnection());
  }, []);

  return (
    <>
      <Router basename={process.env.BASENAME || ''}>
        <Switch>
          <Route path="/" component={Home} exact />
          <Route path="/create" component={Create} />
          <Route path="/access" component={Access} />
          <AuthRequiredRoute path="/wallets" component={Wallets} />
          <AuthRequiredRoute path="/wallet/:symbol" component={Wallet} />
          <AuthRequiredRoute path="/send/:symbol" component={Send} />
          <AuthRequiredRoute path="/swap/:swap" component={Swap} />
          <AuthRequiredRoute path="/dashboard_old" component={DashboardOld} />
        </Switch>
      </Router>
      <ModalManager />
    </>
  );
};
