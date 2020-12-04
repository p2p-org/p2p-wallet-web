import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';

import NProgress from 'nprogress';

import { ModalManager } from 'components/common/ModalManager';
import { NotifyToast } from 'components/common/NotifyToast/NotifyToast';
import { ToastManager } from 'components/common/ToastManager';
import { Access } from 'pages/Access';
import { Create } from 'pages/Create';
import { Home } from 'pages/Home';
import { Send } from 'pages/Send';
import { Swap } from 'pages/Swap';
import { Wallet } from 'pages/Wallet';
import { Wallets } from 'pages/Wallets';
import { establishConnection, getRates } from 'store/_actions/complex';
import { RootState } from 'store/rootReducer';
import { AuthRequiredRoute } from 'utils/routes/UserRequiredRoute';

NProgress.configure({ showSpinner: false });

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

const App: React.FC = () => {
  // const dispatch = useDispatch();
  const loading = useSelector((state: RootState) => state.global.loading);

  // useEffect(() => {
  //   const mount = async () => {
  //     await dispatch(establishConnection());
  //     await dispatch(getRates());
  //   };
  //
  //   void mount();
  // }, []);

  useEffect(() => {
    if (loading) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [Boolean(loading)]);

  return (
    <>
      {/* Hack for states and hash routing until use own host */}
      <Router basename={process.env.BASENAME || `${window.location.pathname}#`}>
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
      <ToastManager anchor="right" renderToast={(props) => <NotifyToast {...props} />} />
    </>
  );
};

// eslint-disable-next-line import/no-default-export
export default App;
