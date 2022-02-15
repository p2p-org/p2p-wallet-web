import type { FunctionComponent } from 'react';
import { useEffect } from 'react';

import { useUserTokenAccounts } from '@p2p-wallet-web/core';
import { useIsMobile } from '@p2p-wallet-web/ui';

import { Layout } from 'components/common/Layout';
import { WidgetPageWithBottom } from 'components/common/WidgetPageWithBottom';
import { NavButtonsMenu, TokensWidget, UsernameBanner } from 'components/pages/home';
import { EmptyWalletWidget } from 'components/pages/home/EmptyWalletWidget';
import { TopWithBalance } from 'components/pages/home/TopWithBalance';
import { trackEvent } from 'utils/analytics';

export const Home: FunctionComponent = () => {
  const isMobile = useIsMobile();
  const userTokenAccounts = useUserTokenAccounts();

  useEffect(() => {
    trackEvent('wallets_open');
  }, []);

  return (
    <Layout>
      <UsernameBanner />
      {userTokenAccounts.length ? (
        <WidgetPageWithBottom title="Wallets" icon="wallet">
          <TopWithBalance />
          {isMobile ? <NavButtonsMenu /> : undefined}

          <TokensWidget />
        </WidgetPageWithBottom>
      ) : (
        <EmptyWalletWidget />
      )}
    </Layout>
  );
};
