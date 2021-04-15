import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

import { FeaturesToggle } from 'components/common/FeaturesToggle';
import { ModalManager } from 'components/common/ModalManager';
import { NotifyToast } from 'components/common/NotifyToast';
import { ToastManager } from 'components/common/ToastManager';
import { Access } from 'pages/Access';
import { Create } from 'pages/Create';
import { Home } from 'pages/Home';
import { Landing } from 'pages/Landing';
import { Receive } from 'pages/Receive';
import { Send } from 'pages/Send';
import { Settings } from 'pages/Settings';
import { SettingsNetwork } from 'pages/SettingsNetwork';
import { Swap } from 'pages/Swap';
import { Wallet } from 'pages/Wallet';
import { Wallets } from 'pages/Wallets';
import { WalletSettings } from 'pages/WalletSettings';
import { AuthRequiredRoute } from 'utils/routes/UserRequiredRoute';

dayjs.extend(localizedFormat);

const App: React.FC = () => {
  return (
    <>
      <Router basename={process.env.REACT_APP_BASENAME}>
        <Switch>
          <Route path="/" component={Landing} exact />
          <Route path="/enter" component={Home} exact />
          <Route path="/create" component={Create} />
          <Route path="/access" component={Access} />
          <AuthRequiredRoute path="/wallets" component={Wallets} />
          <AuthRequiredRoute path="/wallet/:publicKey/settings" component={WalletSettings} />
          <AuthRequiredRoute path="/wallet/:publicKey" component={Wallet} />
          <AuthRequiredRoute path="/receive" component={Receive} />
          <AuthRequiredRoute path="/send/:publicKey/:status(result)" component={Send} />
          <AuthRequiredRoute path="/send/:publicKey?" component={Send} />
          <AuthRequiredRoute path="/swap/:publicKey?" component={Swap} />
          <AuthRequiredRoute path="/settings/network" component={SettingsNetwork} />
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
