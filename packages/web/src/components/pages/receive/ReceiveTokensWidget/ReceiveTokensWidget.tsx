import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { styled } from '@linaria/react';
import { useTokensContext } from '@p2p-wallet-web/core';
import { useIsTablet } from '@p2p-wallet-web/ui';
import type { Token } from '@saberhq/token-utils';
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

const DEBOUNCE_DELAY = 200;
const WRAPPED_SOL_MINT = 'So11111111111111111111111111111111111111112';

export const ReceiveTokensWidget: FC = () => {
  const { tokens: tokensNotFiltered } = useTokensContext();
  const isTablet = useIsTablet();

  const [searchQuery, setSearchQuery] = useState('');

  const [searchQueryDebounced] = useDebounce(searchQuery, DEBOUNCE_DELAY);

  const tokens = useMemo(() => {
    return tokensNotFiltered.filter((token: Token) => token.address !== WRAPPED_SOL_MINT);
  }, [tokensNotFiltered]);

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
