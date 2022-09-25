import type { FC } from 'react';

import { styled } from '@linaria/react';
import { up, useIsMobile } from '@p2p-wallet-web/ui';
import { observer } from 'mobx-react-lite';

import { Token } from 'new/sdk/SolanaSDK';
import { StaticSectionsCollectionVirtualizedView } from 'new/ui/components/common/StaticSectionsCollectionVitualizedView';

import { EmptyError } from '../common/EmptyError';
import { Hint } from '../common/Hint';
import type { SupportedTokensViewModel } from '../SupportedTokens.ViewModel';
import { Cell } from './Cell';

const StaticSectionsCollectionVirtualizedViewStyled = styled(
  StaticSectionsCollectionVirtualizedView,
)`
  height: 600px;
  overflow-y: auto;

  ${up.tablet} {
    height: 300px;
  }
`;

export type TokenOrStringType = Token | string;

interface Props {
  viewModel: Readonly<SupportedTokensViewModel>;
}

export const CollectionView: FC<Props> = observer(({ viewModel }) => {
  const isMobile = useIsMobile();

  const renderItem = (token: TokenOrStringType) => {
    if (token instanceof Token) {
      return <Cell token={token} />;
    }

    if (token === 'hint') {
      return <Hint />;
    }
  };

  const renderEmpty = isMobile ? () => <EmptyError searchText={viewModel.keyword} /> : undefined;

  const transformer = isMobile ? (tokens: TokenOrStringType[]) => ['hint', ...tokens] : undefined;

  return (
    <StaticSectionsCollectionVirtualizedViewStyled<TokenOrStringType>
      viewModel={viewModel}
      renderPlaceholder={() => <Cell isPlaceholder />}
      renderItem={renderItem}
      renderEmpty={renderEmpty}
      transformer={transformer}
    />
  );
});
