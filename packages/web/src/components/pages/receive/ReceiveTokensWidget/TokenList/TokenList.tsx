import type { FC } from 'react';
import { useMemo, useRef } from 'react';
import type { VirtualItem } from 'react-virtual';
import { useVirtual } from 'react-virtual';

import { styled } from '@linaria/react';
import { up, useIsMobile } from '@p2p-wallet-web/ui';
import type { Token } from '@saberhq/token-utils';

import { EmptyError } from 'components/pages/receive/ReceiveTokensWidget/common/EmptyError';

import { Hint } from '../common/Hint';
import { TokenRow } from './TokenRow';

const Wrapper = styled.div`
  height: 600px;
  overflow-y: auto;

  ${up.tablet} {
    height: 300px;
  }
`;

const Container = styled.div``;

const ROW_MARGIN = 8;

interface Props {
  tokens: readonly Token[];
  searchText: string;
}

export const TokenList: FC<Props> = ({ tokens, searchText }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const items = useMemo(() => {
    const newItems: (Token | string)[] = tokens.slice(0);

    if (isMobile) {
      if (searchText && tokens.length === 0) {
        newItems.unshift('error');
      }

      newItems.unshift('hint');
    }

    return newItems;
  }, [isMobile, searchText, tokens]);

  const rowVirtualizer = useVirtual({
    paddingStart: 0,
    paddingEnd: 8,
    size: items.length,
    parentRef,
    overscan: 6,
  });

  const renderRow = (virtualRow: VirtualItem) => {
    if (items[virtualRow.index] === 'hint') {
      return (
        <Hint
          ref={virtualRow.measureRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualRow.start}px)`,
          }}
        />
      );
    }

    if (items[virtualRow.index] === 'error') {
      return (
        <EmptyError
          ref={virtualRow.measureRef}
          searchText={searchText}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualRow.start + ROW_MARGIN}px)`,
          }}
        />
      );
    }

    return (
      <TokenRow
        ref={virtualRow.measureRef}
        key={virtualRow.index}
        token={items[virtualRow.index] as Token}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualRow.start + ROW_MARGIN}px)`,
        }}
      />
    );
  };

  return (
    <Wrapper ref={parentRef}>
      <Container
        style={{
          position: 'relative',
          width: '100%',
          height: rowVirtualizer.totalSize,
        }}
      >
        {rowVirtualizer.virtualItems.map(renderRow)}
      </Container>
    </Wrapper>
  );
};
