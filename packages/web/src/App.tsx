import * as React from 'react';
import { BrowserRouter, HashRouter, Route, Switch } from 'react-router-dom';

import * as Sentry from '@sentry/react';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';

import { FeaturesToggle } from 'components/common/FeaturesToggle';
import { Intercom } from 'components/common/Intercom';
import { NotifyToast } from 'components/common/NotifyToast';
import { ToastManager } from 'components/common/ToastManager';
import { Main } from 'new/scenes/Main';
import { Buy } from 'new/scenes/Main/Buy';
import { Home } from 'new/scenes/Main/Home';
import { Settings as SettingsNew } from 'new/scenes/Main/Settings';
import { SettingsNetwork as SettingsNetworkNew } from 'new/scenes/Main/SettingsNetwork';
import { Root } from 'new/scenes/Root';
import { LocationManager } from 'new/ui/components/root/LocationManager';
import { ModalManager } from 'new/ui/modals/ModalManager';
import { Auth } from 'pages/Auth';
import { Landing } from 'pages/Landing';
import { Receive } from 'pages/Receive';
import { Send } from 'pages/Send';
import { Settings } from 'pages/Settings';
import { SettingsNetwork } from 'pages/SettingsNetwork';
import { Swap } from 'pages/Swap';
import { Wallet } from 'pages/Wallet';
import { WalletSettings } from 'pages/WalletSettings';
import { AuthRequiredRoute } from 'utils/routes/UserRequiredRoute';

import { Providers } from './Providers';

dayjs.extend(localizedFormat);

const App: React.FC = () => {
  const Router: React.ElementType = process.env.REACT_APP_STAGING ? HashRouter : BrowserRouter;

  return (
    <>
      <Sentry.ErrorBoundary>
        <Router basename={process.env.PUBLIC_URL}>
          <Providers>
            <Root>
              <LocationManager />
              <Switch>
                <Route path="/" exact component={Landing} />
                <Route path="/:type(signup|login)" exact component={Auth} />
                <Main>
                  <AuthRequiredRoute path="/wallets" component={Home} />
                  <AuthRequiredRoute
                    path="/wallet/:publicKey/settings"
                    component={WalletSettings}
                  />
                  <AuthRequiredRoute path="/wallet/:publicKey" exact component={Wallet} />
                  <AuthRequiredRoute path="/buy/:symbol?" component={Buy} />
                  <AuthRequiredRoute path="/receive/(tokens)?" component={Receive} />
                  <AuthRequiredRoute path="/send/:publicKey/:status(result)" component={Send} />
                  <AuthRequiredRoute path="/send/:publicKey?" component={Send} />
                  <AuthRequiredRoute path="/swap/(settings)?/:symbol?" component={Swap} />
                  <AuthRequiredRoute path="/settings/networkNew" component={SettingsNetworkNew} />
                  <AuthRequiredRoute path="/settingsNew" component={SettingsNew} />
                  <AuthRequiredRoute path="/settings/network" component={SettingsNetwork} />
                  <AuthRequiredRoute path="/settings" component={Settings} />
                </Main>
              </Switch>
              <Intercom />
              <FeaturesToggle />
              <ToastManager anchor="left" renderToast={(props) => <NotifyToast {...props} />} />
              <ModalManager />
            </Root>
          </Providers>
        </Router>
      </Sentry.ErrorBoundary>
    </>
  );
};

// eslint-disable-next-line import/no-default-export
export default App;
