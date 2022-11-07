import * as React from 'react';
import { BrowserRouter, HashRouter, Route, Switch } from 'react-router-dom';

import * as Sentry from '@sentry/react';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { observer } from 'mobx-react-lite';

import { Intercom } from 'components/common/Intercom';
import { NotifyToast } from 'components/common/NotifyToast';
import { ToastManager } from 'components/common/ToastManager';
import {
  Buy,
  Home,
  Main,
  Receive,
  Send,
  Settings,
  SettingsNetwork,
  SwapPage,
  WalletDetail,
} from 'new/scenes/Main';
import { Root } from 'new/scenes/Root';
import {
  DebugFeatureFlagsManager,
  LocationManager,
  ModalManager,
  NotificationManager,
} from 'new/ui/managers';
import { Auth as AuthTrial } from 'new/scenes/Main/Auth';
import { Landing } from 'pages/Landing';
import { AuthRequiredRoute } from 'utils/routes/UserRequiredRoute';

import { Providers } from './Providers';

dayjs.extend(localizedFormat);

const App: React.FC = observer(() => {
  const Router: React.ElementType = process.env.REACT_APP_STAGING ? HashRouter : BrowserRouter;

  return (
    <>
      <Sentry.ErrorBoundary>
        <Router basename={process.env.REACT_APP_BASENAME}>
          <Providers>
            <Root>
              <LocationManager />
              <Switch>
                <Route path="/" exact component={Landing} />
                <Route path="/onboard" exact component={AuthTrial} />
                <Main>
                  <AuthRequiredRoute path="/wallets" component={Home} />
                  <AuthRequiredRoute path="/wallet/:publicKey" exact component={WalletDetail} />
                  <AuthRequiredRoute path="/buy/:symbol?" component={Buy} />
                  <AuthRequiredRoute path="/receive/(tokens)?" component={Receive} />
                  <AuthRequiredRoute path="/send/:publicKey/:status(result)" component={Send} />
                  <AuthRequiredRoute path="/send/:publicKey?" component={Send} />
                  <AuthRequiredRoute path="/swap/(settings)?/:publicKey?" component={SwapPage} />
                  <AuthRequiredRoute path="/settings/network" component={SettingsNetwork} />
                  <AuthRequiredRoute path="/settings" component={Settings} exact />
                  <ModalManager />
                </Main>
              </Switch>
              <Intercom />
              <ToastManager anchor="left" renderToast={(props) => <NotifyToast {...props} />} />
              <NotificationManager />
              {__DEVELOPMENT__ || process.env.REACT_APP_STAGING ? (
                <DebugFeatureFlagsManager />
              ) : null}
            </Root>
          </Providers>
        </Router>
      </Sentry.ErrorBoundary>
    </>
  );
});

// eslint-disable-next-line import/no-default-export
export default App;
