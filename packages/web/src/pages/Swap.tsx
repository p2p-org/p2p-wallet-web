import type { FunctionComponent } from 'react';
import { useMemo } from 'react';
import { Route, Switch, useLocation, useParams } from 'react-router-dom';

import { useIsMobile } from '@p2p-wallet-web/ui';

import { FeeCompensationProvider } from 'app/contexts';
import { SwapProvider } from 'app/contexts/solana/swap';
import { useTrackEventOpen } from 'app/hooks/metrics';
import { Layout } from 'components/common/Layout';
import { SwapSlippageWidget } from 'components/pages/swap/SwapSlippageWidget';
import { SwapWidget } from 'components/pages/swap/SwapWidget';
import { GoBackAction } from 'components/pages/swap/SwapWidget/GoBackAction';
import { SettingsAction } from 'components/pages/swap/SwapWidget/SettingsAction';

export const Swap: FunctionComponent = () => {
  useTrackEventOpen('Swap_Viewed');

  const { symbol } = useParams<{ symbol?: string }>();
  const isMobile = useIsMobile();
  const location = useLocation();

  const mobileAction = useMemo(() => {
    if (!isMobile) {
      return undefined;
    }

    const isSettingsPage = location.pathname.includes('settings');

    return isSettingsPage ? <GoBackAction /> : <SettingsAction />;
  }, [isMobile, location]);

  return (
    <Layout mobileAction={mobileAction}>
      <FeeCompensationProvider>
        <SwapProvider initialState={{ inputTokenName: symbol }}>
          <Switch>
            <Route path={`/swap/settings/:symbol?`}>
              <SwapSlippageWidget />
            </Route>
            <Route path={'/swap/:symbol?'}>
              <SwapWidget />
            </Route>
          </Switch>
        </SwapProvider>
      </FeeCompensationProvider>
    </Layout>
  );
};
