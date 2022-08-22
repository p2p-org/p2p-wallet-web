import type { FunctionComponent } from 'react';
import { useEffect } from 'react';

import { styled } from '@linaria/react';
import { up, useIsMobile } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { WidgetPage } from 'components/common/WidgetPage';
import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { Layout } from 'new/ui/components/common/Layout';

import { HomeViewModel } from './Home.ViewModel';
import { EmptyWalletView } from './Subviews/EmptyWalletView';
import { Header } from './Subviews/Header';
import { NavButtonsMenu } from './Subviews/NavButtonsMenu';
import { WalletsCollectionView } from './Subviews/WalletsCollectionView';

const Content = styled.div`
  padding: 16px 16px 8px;

  ${up.tablet} {
    padding: 0 16px 16px;
  }
`;

export const Home: FunctionComponent = observer(() => {
  const viewModel = useViewModel<HomeViewModel>(HomeViewModel);
  const isMobile = useIsMobile();

  useEffect(() => {
    viewModel.walletsRepository.reload();
  }, [viewModel.walletsRepository]);

  return (
    <Layout>
      {viewModel.isWalletReady ? (
        <WidgetPage title="Wallets" icon="wallet">
          <Content>
            <Header viewModel={viewModel} />
            {isMobile ? <NavButtonsMenu viewModel={viewModel} /> : undefined}
            <WalletsCollectionView viewModel={viewModel.walletsRepository} />
          </Content>
        </WidgetPage>
      ) : (
        <EmptyWalletView viewModel={viewModel} />
      )}
    </Layout>
  );
});
