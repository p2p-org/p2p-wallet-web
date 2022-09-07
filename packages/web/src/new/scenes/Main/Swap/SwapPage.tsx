import type { FC } from 'react';
import { useMemo } from 'react';
import { Route, Switch } from 'react-router-dom';

import { useIsMobile } from '@p2p-wallet-web/ui';

import { Layout } from 'new/ui/components/common/Layout';

import { Swap } from './Swap';
import { GoBackButton } from './Swap/GoBackButton';
import { SettingsButton } from './Swap/SettingsButton';
import { SwapSettings } from './SwapSettings';

export const SwapPage: FC = () => {
  const isMobile = useIsMobile();

  const mobileHeaderButton = useMemo(() => {
    if (!isMobile) {
      return null;
    }

    return (
      <Switch>
        <Route path={`/swap/settings/:symbol?`}>
          <GoBackButton />
        </Route>
        <Route path={'/swap/:symbol?'}>
          <SettingsButton />
        </Route>
      </Switch>
    );
  }, [isMobile]);

  return (
    <Layout mobileAction={mobileHeaderButton}>
      <Switch>
        <Route path={`/swap/settings/:symbol?`}>
          <SwapSettings />
        </Route>
        <Route path={'/swap/:symbol?'}>
          <Swap />
        </Route>
      </Switch>
    </Layout>
  );
};
