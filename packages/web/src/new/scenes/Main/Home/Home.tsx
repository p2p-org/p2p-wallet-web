import type { FC } from 'react';

import { styled } from '@linaria/react';
import { up, useIsMobile } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { Layout } from 'components/common/Layout';
import { WidgetPage } from 'components/common/WidgetPage';
import { useViewModel } from 'new/core/viewmodels/useViewModel';

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

export const Home: FC = observer(() => {
  const viewModel = useViewModel<HomeViewModel>(HomeViewModel);
  const isMobile = useIsMobile();

  // useLayoutEffect(() => {
  //   viewModel.walletsRepository.reload();
  // }, [viewModel.walletsRepository]);

  return (
    <Layout>
      {viewModel.isWalletReady ? (
        <WidgetPage title="Wallets" icon="wallet">
          <Content>
            <Header viewModel={viewModel} />
            {isMobile ? <NavButtonsMenu /> : undefined}
            <WalletsCollectionView viewModel={viewModel.walletsRepository} />
          </Content>
        </WidgetPage>
      ) : (
        <EmptyWalletView />
      )}
    </Layout>
  );
});
