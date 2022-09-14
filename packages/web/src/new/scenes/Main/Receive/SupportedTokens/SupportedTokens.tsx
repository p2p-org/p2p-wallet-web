import type { FC } from 'react';

import { useIsTablet } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { Content } from 'new/scenes/Main/Receive/common/styled';
import { CollectionView } from 'new/scenes/Main/Receive/SupportedTokens/CollectionView';
import { EmptyError } from 'new/scenes/Main/Receive/SupportedTokens/common/EmptyError';
import { Hint } from 'new/scenes/Main/Receive/SupportedTokens/common/Hint';
import type { SupportedTokensViewModel } from 'new/scenes/Main/Receive/SupportedTokens/SupportedTokens.ViewModel';
import { Layout } from 'new/ui/components/common/Layout';
import { WidgetPage } from 'new/ui/components/common/WidgetPage';
import { SearchInput } from 'new/ui/components/ui/SearchInput';

type Props = {
  viewModel: Readonly<SupportedTokensViewModel>;
};

export const SupportedTokens: FC<Props> = observer(({ viewModel }) => {
  const isTablet = useIsTablet();

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
