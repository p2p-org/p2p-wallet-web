import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

import { ModalManager } from 'components/common/ModalManager';
import { NotifyToast } from 'components/common/NotifyToast';
import { ToastManager } from 'components/common/ToastManager';
import { Access } from 'pages/Access';
import { Create } from 'pages/Create';
import { Home } from 'pages/Home';
import { Receive } from 'pages/Receive';
import { Send } from 'pages/Send';
import { Swap } from 'pages/Swap';
import { Wallet } from 'pages/Wallet';
import { Wallets } from 'pages/Wallets';
import { connect } from 'store/slices/wallet/WalletSlice';
import { AuthRequiredRoute } from 'utils/routes/UserRequiredRoute';

dayjs.extend(localizedFormat);

/* Hack for states and hash routing until use own host */
const FixRoute = () => {
  const history = useHistory();

  useEffect(() => {
    if (!window.location.hash.includes('#')) {
      history.replace('/');
    }
  }, []);

  return null;
};

const Authorize = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    const mount = async () => {
      await dispatch(connect());

      setTimeout(() => {
        history.push('/wallets');
      }, 100);
    };

    void mount();
  }, []);

  return null;
};

const App: React.FC = () => {
  return (
    <>
      {/* Hack for states and hash routing until use own host */}
      <Router basename={process.env.BASENAME || `${window.location.pathname}#`}>
        {/* Hack for states and hash routing until use own host */}
        <FixRoute />
        <Authorize />
        <Switch>
          <Route path="/" component={Home} exact />
          <Route path="/create" component={Create} />
          <Route path="/access" component={Access} />
          <AuthRequiredRoute path="/wallets" component={Wallets} />
          <AuthRequiredRoute path="/wallet/:publicKey" component={Wallet} />
          <AuthRequiredRoute path="/receive" component={Receive} />
          <AuthRequiredRoute path="/send/:publicKey/:status(result)" component={Send} />
          <AuthRequiredRoute path="/send/:publicKey?" component={Send} />
          <AuthRequiredRoute path="/swap/:publicKey?" component={Swap} />
        </Switch>
      </Router>
      <ModalManager />
      <ToastManager anchor="right" renderToast={(props) => <NotifyToast {...props} />} />
    </>
  );
};

// eslint-disable-next-line import/no-default-export
export default App;
