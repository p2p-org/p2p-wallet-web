import type { FC } from 'react';

import { styled } from '@linaria/react';
import { up, useIsMobile } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { Cell } from 'new/scenes/Main/Receive/SupportedTokens/CollectionView/Cell';
import { EmptyError } from 'new/scenes/Main/Receive/SupportedTokens/common/EmptyError';
import { Hint } from 'new/scenes/Main/Receive/SupportedTokens/common/Hint';
import type { SupportedTokensViewModel } from 'new/scenes/Main/Receive/SupportedTokens/SupportedTokens.ViewModel';
import { Token } from 'new/sdk/SolanaSDK';
import { StaticSectionsCollectionView } from 'new/ui/components/common/StaticSectionsCollectionView';

const Wrapper = styled.div`
  height: 600px;
  overflow-y: auto;

  ${up.tablet} {
    height: 300px;
  }
`;

type ListItemType = Token | string;

interface Props {
  viewModel: Readonly<SupportedTokensViewModel>;
}

export const CollectionView: FC<Props> = observer(({ viewModel }) => {
  const isMobile = useIsMobile();

  const renderItem = (token: ListItemType) => {
    if (token instanceof Token) {
      return <Cell key={token.address} token={token} />;
    }

    if (token === 'hint') {
      return <Hint />;
    }
  };

  const renderEmpty = isMobile
    ? (key: string) => <EmptyError key={key} searchText={viewModel.keyword} />
    : undefined;

  const transformer = isMobile ? (tokens: ListItemType[]) => ['hint', ...tokens] : undefined;

  return (
    <Wrapper>
      <StaticSectionsCollectionView<ListItemType>
        viewModel={viewModel}
        renderPlaceholder={(key: string) => <Cell key={key} isPlaceholder />}
        renderItem={renderItem}
        renderEmpty={renderEmpty}
        transformer={transformer}
      />
    </Wrapper>
  );
});
