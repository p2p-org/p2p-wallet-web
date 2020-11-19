import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';

import { ModalManager } from 'components/common/ModalManager';
import { Access, Create, Home, Send, Swap, Wallet, Wallets } from 'pages';
import { establishConnection, getRates } from 'store/actions/complex';
import { RootState } from 'store/types';
import { AuthRequiredRoute } from 'utils/routes/UserRequiredRoute';

/* Hack for states and hash routing until use own host */
const FixRoute = () => {
  const history = useHistory();

  useEffect(() => {
    if (!location.hash.includes('#')) {
      history.replace('/');
    }
  }, []);

  return null;
};

export const App: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const mount = async () => {
      await dispatch(establishConnection());
      await dispatch(getRates());
    };

    void mount();
  }, []);

  return (
    <>
      {/* Hack for states and hash routing until use own host */}
      <Router basename={process.env.BASENAME || `${location.pathname}#`}>
        {/* Hack for states and hash routing until use own host */}
        <FixRoute />
        <Switch>
          <Route path="/" component={Home} exact />
          <Route path="/create" component={Create} />
          <Route path="/access" component={Access} />
          <AuthRequiredRoute path="/wallets" component={Wallets} />
          <AuthRequiredRoute path="/wallet/:publicKey" component={Wallet} />
          <AuthRequiredRoute path="/send/:publicKey/:status(result)" component={Send} />
          <AuthRequiredRoute path="/send/:publicKey" component={Send} />
          <AuthRequiredRoute path="/swap/:publicKey" component={Swap} />
        </Switch>
      </Router>
      <ModalManager />
    </>
  );
};
