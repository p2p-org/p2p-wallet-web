import type { FunctionComponent } from 'react';
import { useEffect } from 'react';

import { styled } from '@linaria/react';
import { up, useIsMobile } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { Layout } from 'components/common/Layout';
import { WidgetPage } from 'components/common/WidgetPage';
import { NavButtonsMenu, TokensWidget } from 'components/pages/home';
import { EmptyWalletWidget } from 'components/pages/home/EmptyWalletWidget';
import { HomeViewModel } from 'new/scenes/Main/Home/Home.ViewModel';
import { WalletsCollectionView } from 'new/scenes/Main/Home/Subviews/WalletsCollectionView';
import { useViewModel } from 'new/viewmodels/useViewModel';

import { Header } from './Subviews/Header';

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

export const Home: FunctionComponent = observer(() => {
  const viewModel = useViewModel<HomeViewModel>(HomeViewModel);
  const isMobile = useIsMobile();

  useEffect(() => {
    viewModel.walletsRepository.reload();
  }, []);

  return (
    <Layout>
      {viewModel.isWalletReady ? (
        <WidgetPage title="Wallets" icon="wallet">
          <Content>
            <Header viewModel={viewModel} />
            {isMobile ? <NavButtonsMenu /> : undefined}
            <WalletsCollectionView viewModel={viewModel.walletsRepository} />
            {/*<TokensWidgetStyled />*/}
          </Content>
        </WidgetPage>
      ) : (
        <EmptyWalletWidget isLoading={false} />
      )}
    </Layout>
  );
});
