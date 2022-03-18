import * as React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

import { FeaturesToggle } from 'components/common/FeaturesToggle';
import { Intercom } from 'components/common/Intercom';
import { NotifyToast } from 'components/common/NotifyToast';
import { ToastManager } from 'components/common/ToastManager';
import { Auth } from 'pages/Auth';
import { Buy } from 'pages/Buy';
import { Home } from 'pages/Home';
import { Landing } from 'pages/Landing';
import { Receive } from 'pages/Receive';
import { Send } from 'pages/Send';
import { Settings } from 'pages/Settings';
import { SettingsNetwork } from 'pages/SettingsNetwork';
import { Swap } from 'pages/Swap';
// import { SwapNew } from 'pages/SwapNew';
import { Wallet } from 'pages/Wallet';
import { WalletSettings } from 'pages/WalletSettings';
import { AuthRequiredRoute } from 'utils/routes/UserRequiredRoute';

import { Providers } from './Providers';

dayjs.extend(localizedFormat);

const App: React.FC = () => {
  return (
    <>
      <Router basename={process.env.REACT_APP_BASENAME}>
        <Providers>
          <Switch>
            <Route path="/" component={Landing} exact />
            <Route path="/:type(signup|login)" component={Auth} exact />
            <AuthRequiredRoute path="/wallets" component={Home} />
            <AuthRequiredRoute path="/wallet/:publicKey/settings" component={WalletSettings} />
            <AuthRequiredRoute path="/wallet/:publicKey" exact component={Wallet} />
            <AuthRequiredRoute path="/receive/(tokens)?" component={Receive} />
            <AuthRequiredRoute path="/send/:publicKey/:status(result)" component={Send} />
            <AuthRequiredRoute path="/send/:publicKey?" component={Send} />
            <AuthRequiredRoute path="/swap/:symbol?" component={Swap} />
            {/*<AuthRequiredRoute path="/swap/:publicKey?" component={SwapNew} />*/}
            <AuthRequiredRoute path="/settings/network" component={SettingsNetwork} />
            <AuthRequiredRoute path="/settings" component={Settings} />
            <AuthRequiredRoute path="/buy/:symbol?" component={Buy} />
          </Switch>
          <Intercom />
          <FeaturesToggle />
          <ToastManager anchor="left" renderToast={(props) => <NotifyToast {...props} />} />
        </Providers>
      </Router>
    </>
  );
};

// eslint-disable-next-line import/no-default-export
export default App;
