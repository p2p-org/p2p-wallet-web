import type { FC } from 'react';

import { useIsTablet } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { useViewModel } from 'new/core/viewmodels/useViewModel';
import { Layout } from 'new/ui/components/common/Layout';
import { WidgetPage } from 'new/ui/components/common/WidgetPage';
import { SearchInput } from 'new/ui/components/ui/SearchInput';

import { Content } from '../ReceiveToken/common/styled';
import { CollectionView } from './CollectionView';
import { EmptyError } from './common/EmptyError';
import { Hint } from './common/Hint';
import { SupportedTokensViewModel } from './SupportedTokens.ViewModel';

export const SupportedTokens: FC = observer(() => {
  const isTablet = useIsTablet();
  const viewModel = useViewModel(SupportedTokensViewModel);

  return (
    <Layout>
      <WidgetPage title={['Receive', 'List of available tokens']} backTo="/receive">
        <Content>
          <SearchInput
            placeholder="Search for a token"
            onChange={(value) => viewModel.search(value)}
          />
          {isTablet ? <Hint /> : undefined}
          {isTablet && viewModel.keyword && viewModel.data.length === 0 ? (
            <EmptyError searchText={viewModel.keyword} />
          ) : undefined}

          <CollectionView viewModel={viewModel} />
        </Content>
      </WidgetPage>
    </Layout>
  );
});
