import 'new/services/Defaults';

import * as React from 'react';
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';

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
import { Auth as AuthTrial } from 'new/scenes/Main/Auth';
import { Root } from 'new/scenes/Root';
import {
  DebugFeatureFlagsManager,
  LocationManager,
  ModalManager,
  NotificationManager,
} from 'new/ui/managers';
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
              <Routes>
                <Route path="/" element={Landing} />
                <Route path="/onboard" element={AuthTrial} />
                <Main>
                  <AuthRequiredRoute path="/wallets" element={Home} />
                  <AuthRequiredRoute path="/wallet/:publicKey" element={WalletDetail} />
                  <AuthRequiredRoute path="/buy/:symbol?" element={Buy} />
                  <AuthRequiredRoute path="/receive/(tokens)?" element={Receive} />
                  <AuthRequiredRoute path="/send/*" element={Send} />
                  <AuthRequiredRoute path="/swap/*" element={SwapPage} />
                  <AuthRequiredRoute path="/settings/network" element={SettingsNetwork} />
                  <AuthRequiredRoute path="/settings" element={Settings} />
                  <ModalManager />
                </Main>
              </Routes>
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
