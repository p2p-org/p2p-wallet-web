import 'new/services/Defaults';

import * as React from 'react';
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';

import * as Sentry from '@sentry/react';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import { observer } from 'mobx-react-lite';

import { Intercom } from 'components/common/Intercom';
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
import { AuthRequiredRoute } from 'utils/routes';

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
              <Routes>
                <Route element={<LocationManager />} />
                <Route element={<Intercom />} />

                <Route path="/" element={<Landing />} />
                <Route path="/onboard" element={<AuthTrial />} />

                <Route element={<Main />} />
                <Route element={<AuthRequiredRoute />}>
                  <Route path="/wallets" element={<Home />} />
                  <Route path="/wallet/:publicKey" element={<WalletDetail />} />
                  <Route path="/buy/:symbol?" element={<Buy />} />
                  <Route path="/receive/(tokens)?" element={<Receive />} />
                  <Route path="/send/*" element={<Send />} />
                  <Route path="/swap/*" element={<SwapPage />} />
                  <Route path="/settings/network" element={<SettingsNetwork />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Routes>
              <ModalManager />
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
