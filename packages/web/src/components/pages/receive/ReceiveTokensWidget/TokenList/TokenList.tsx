import type { FC } from 'react';
import { useCallback, useRef } from 'react';
import { useVirtual } from 'react-virtual';

import { styled } from '@linaria/react';
import type { Token } from '@saberhq/token-utils';

import { TOKEN_ROW_HEIGHT, TokenRow } from './TokenRow';

const Wrapper = styled.div`
  height: 300px;
  overflow-y: auto;
`;

const Container = styled.div``;

const TOKEN_ROW_MARGIN = 8;

interface Props {
  tokens: readonly Token[];
}

export const TokenList: FC<Props> = ({ tokens }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtual({
    paddingStart: 0,
    paddingEnd: 8,
    size: tokens.length,
    parentRef,
    estimateSize: useCallback(() => TOKEN_ROW_HEIGHT + TOKEN_ROW_MARGIN, []),
    overscan: 6,
  });

  return (
    <Wrapper ref={parentRef}>
      <Container
        style={{
          position: 'relative',
          width: '100%',
          height: `${rowVirtualizer.totalSize}px`,
        }}
      >
        {rowVirtualizer.virtualItems.map((virtualRow) => (
          <TokenRow
            key={virtualRow.index}
            token={tokens[virtualRow.index]!}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          />
        ))}
      </Container>
    </Wrapper>
  );
};
