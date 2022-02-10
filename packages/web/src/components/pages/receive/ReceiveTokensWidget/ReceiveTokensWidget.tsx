import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { styled } from '@linaria/react';
import { useAllTokens } from '@p2p-wallet-web/core';
import { borders, theme } from '@p2p-wallet-web/ui';
import Fuse from 'fuse.js';
import { useDebounce } from 'use-debounce';

import { WidgetPage } from 'components/common/WidgetPage';
import { SearchInput } from 'components/ui';

import { TokenList } from './TokenList';

const Content = styled.div`
  display: grid;
  grid-gap: 8px;
  padding: 16px 16px 0;
`;

const Hint = styled.div`
  padding: 16px 20px;

  color: ${theme.colors.textIcon.primary};
  font-size: 14px;
  line-height: 160%;
  letter-spacing: 0.01em;

  background: ${theme.colors.bg.app};
  border-radius: 12px;
  ${borders.primaryRGBA}
`;

interface Props {}

export const ReceiveTokensWidget: FC<Props> = () => {
  const { tokens } = useAllTokens();

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
        <Hint>
          Each token in this list is available for receiving with this address; you can search for a
          token by typing its name or ticker.
          <br />
          <br />
          If a token is not on this list,{' '}
          <strong>we do not recommend sending it to this address</strong>.
        </Hint>
        <TokenList tokens={results} />
      </Content>
    </WidgetPage>
  );
};
