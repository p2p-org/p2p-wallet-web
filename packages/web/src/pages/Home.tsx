import type { FunctionComponent } from 'react';
import { useEffect, useMemo } from 'react';

import { styled } from '@linaria/react';
import { useUserTokenAccounts } from '@p2p-wallet-web/core';
import { up, useIsMobile } from '@p2p-wallet-web/ui';

import { Layout } from 'components/common/Layout';
import { WidgetPage } from 'components/common/WidgetPage';
import { NavButtonsMenu, TokensWidget } from 'components/pages/home';
import { EmptyWalletWidget } from 'components/pages/home/EmptyWalletWidget';
import { TopWithBalance } from 'components/pages/home/TopWithBalance';
import { trackEvent } from 'utils/analytics';

const Content = styled.div`
  padding: 16px 16px 8px;

  ${up.tablet} {
    padding: 0 16px 16px;
  }
`;

const TokensWidgetStyled = styled(TokensWidget)`
  margin-right: -16px;
  margin-left: -16px;

  ${up.tablet} {
    margin: inherit;
  }
`;

export const Home: FunctionComponent = () => {
  const isMobile = useIsMobile();
  const userTokenAccounts = useUserTokenAccounts();

  useEffect(() => {
    trackEvent('wallets_open');
  }, []);

  const hasSomeBalance = useMemo(() => {
    return userTokenAccounts.some((value) => value.balance?.greaterThan(0));
  }, [userTokenAccounts]);

  return (
    <Layout>
      {hasSomeBalance ? (
        <WidgetPage title="Wallets" icon="wallet">
          <Content>
            <TopWithBalance />
            {isMobile ? <NavButtonsMenu /> : undefined}
            <TokensWidgetStyled />
          </Content>
        </WidgetPage>
      ) : (
        <EmptyWalletWidget isLoading={!userTokenAccounts.length} />
      )}
    </Layout>
  );
};
