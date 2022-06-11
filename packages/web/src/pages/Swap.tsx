import type { FunctionComponent } from 'react';
import { useMemo } from 'react';
import { Route, Switch, useLocation, useParams } from 'react-router-dom';

import { useIsMobile } from '@p2p-wallet-web/ui';

import { SwapProvider } from 'app/contexts/solana/swap';
import { useTrackEventOpen } from 'app/hooks/metrics';
import { Layout } from 'components/common/Layout';
import { SwapSlippageWidget } from 'components/pages/swap/SwapSlippageWidget';
import { SwapWidget } from 'components/pages/swap/SwapWidget';
import { GoBackButton } from 'components/pages/swap/SwapWidget/GoBackButton';
import { SettingsButton } from 'components/pages/swap/SwapWidget/SettingsButton';

export const Swap: FunctionComponent = () => {
  useTrackEventOpen('Swap_Viewed');

  const { symbol } = useParams<{ symbol?: string }>();
  const isMobile = useIsMobile();
  const location = useLocation();

  const mobileHeaderButton = useMemo(() => {
    if (!isMobile) {
      return undefined;
    }

    const isSettingsPage = location.pathname.includes('settings');

    return isSettingsPage ? <GoBackButton /> : <SettingsButton />;
  }, [isMobile, location]);

  return (
    <Layout mobileAction={mobileHeaderButton}>
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
    </Layout>
  );
};
