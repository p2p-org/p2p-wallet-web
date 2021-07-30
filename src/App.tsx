import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { useFeature } from 'flagged';

import { FeaturesToggle } from 'components/common/FeaturesToggle';
import { Intercom } from 'components/common/Intercom';
import { ModalManager } from 'components/common/ModalManager';
import { NotifyToast } from 'components/common/NotifyToast';
import { ToastManager } from 'components/common/ToastManager';
import { FEATURE_LANDING } from 'config/featureFlags';
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

import { Providers } from './Providers';

dayjs.extend(localizedFormat);

const App: React.FC = () => {
  const isFeatureLanding = useFeature(FEATURE_LANDING);

  return (
    <>
      <Providers>
        <Router basename={process.env.REACT_APP_BASENAME}>
          <Switch>
            {isFeatureLanding ? (
              <Route path="/" component={Landing} exact />
            ) : (
              <Route path="/" component={Home} exact />
            )}
            <Route path="/:type(signup|login)" component={Home} exact />
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
          <Intercom />
        </Router>
        <ModalManager />
        <ToastManager anchor="left" renderToast={(props) => <NotifyToast {...props} />} />
        <FeaturesToggle />
      </Providers>
    </>
  );
};

// eslint-disable-next-line import/no-default-export
export default App;
