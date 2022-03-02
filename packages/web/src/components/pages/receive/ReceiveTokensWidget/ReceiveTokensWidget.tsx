import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { styled } from '@linaria/react';
import { useTokensContext } from '@p2p-wallet-web/core';
import { useIsTablet } from '@p2p-wallet-web/ui';
import Fuse from 'fuse.js';
import { useDebounce } from 'use-debounce';

import { WidgetPage } from 'components/common/WidgetPage';
import { SearchInput } from 'components/ui';

import { EmptyError } from './common/EmptyError';
import { Hint } from './common/Hint';
import { TokenList } from './TokenList';

const Content = styled.div`
  display: grid;
  grid-gap: 8px;
  grid-template-rows: auto auto 1fr;
  padding: 16px 16px 0;
`;

interface Props {}

export const ReceiveTokensWidget: FC<Props> = () => {
  const { tokens } = useTokensContext();
  const isTablet = useIsTablet();

  const [searchQuery, setSearchQuery] = useState('');

  const [searchQueryDebounced] = useDebounce(searchQuery, 200);

  const fuse = useMemo(
    () =>
      new Fuse(tokens, {
        keys: ['symbol', 'name', 'address'],
      }),
    [tokens],
  );

  const results = useMemo(() => {
    const searchResults = fuse.search(searchQueryDebounced).map((r) => r.item);
    return searchQueryDebounced.length === 0 ? tokens : searchResults;
  }, [fuse, searchQueryDebounced, tokens]);

  return (
    <WidgetPage title={['Receive', 'List of available tokens']} backTo="/receive">
      <Content>
        <SearchInput
          placeholder="Search for a token"
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
        />
        {isTablet ? <Hint /> : undefined}
        {isTablet && searchQueryDebounced && results.length === 0 ? (
          <EmptyError searchText={searchQueryDebounced} />
        ) : undefined}

        <TokenList tokens={results} searchText={searchQueryDebounced} />
      </Content>
    </WidgetPage>
  );
};
