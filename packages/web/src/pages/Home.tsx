import type { FunctionComponent } from 'react';
import { useEffect } from 'react';

import { styled } from '@linaria/react';
import { useUserTokenAccounts } from '@p2p-wallet-web/core';
import { up, useIsMobile } from '@p2p-wallet-web/ui';

import { Layout } from 'components/common/Layout';
import { WidgetPage } from 'components/common/WidgetPage';
import { NavButtonsMenu, TokensWidget, UsernameBanner } from 'components/pages/home';
import { EmptyWalletWidget } from 'components/pages/home/EmptyWalletWidget';
import { TopWithBalance } from 'components/pages/home/TopWithBalance';
import { trackEvent } from 'utils/analytics';

const Content = styled.div`
  padding: 16px 16px 8px;

  ${up.tablet} {
    padding: 0 16px 16px;
  }
`;

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
        <WidgetPage title="Wallets" icon="wallet">
          <Content>
            <TopWithBalance />
            {isMobile ? <NavButtonsMenu /> : undefined}
          </Content>

          <TokensWidget />
        </WidgetPage>
      ) : (
        <EmptyWalletWidget />
      )}
    </Layout>
  );
};
