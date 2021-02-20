import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Switch, useHistory } from 'react-router-dom';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

import { FeaturesToggle } from 'components/common/FeaturesToggle';
import { ModalManager } from 'components/common/ModalManager';
import { NotifyToast } from 'components/common/NotifyToast';
import { ToastManager } from 'components/common/ToastManager';
import { Access } from 'pages/Access';
import { Create } from 'pages/Create';
import { Home } from 'pages/Home';
import { Receive } from 'pages/Receive';
import { Send } from 'pages/Send';
import { Settings } from 'pages/Settings';
import { Swap } from 'pages/Swap';
import { Wallet } from 'pages/Wallet';
import { Wallets } from 'pages/Wallets';
import { WalletSettings } from 'pages/WalletSettings';
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

const App: React.FC = () => {
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
          <AuthRequiredRoute path="/wallet/:publicKey/settings" component={WalletSettings} />
          <AuthRequiredRoute path="/wallet/:publicKey" component={Wallet} />
          <AuthRequiredRoute path="/receive" component={Receive} />
          <AuthRequiredRoute path="/send/:publicKey/:status(result)" component={Send} />
          <AuthRequiredRoute path="/send/:publicKey?" component={Send} />
          <AuthRequiredRoute path="/swap/:publicKey?" component={Swap} />
          <AuthRequiredRoute path="/settings" component={Settings} />
        </Switch>
      </Router>
      <ModalManager />
      <ToastManager anchor="right" renderToast={(props) => <NotifyToast {...props} />} />
      <FeaturesToggle />
    </>
  );
};

// eslint-disable-next-line import/no-default-export
export default App;
