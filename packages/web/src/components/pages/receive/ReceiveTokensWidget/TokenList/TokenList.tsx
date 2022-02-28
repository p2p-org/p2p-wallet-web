import type { FC } from 'react';
import { useRef } from 'react';
import type { VirtualItem } from 'react-virtual';
import { useVirtual } from 'react-virtual';

import { styled } from '@linaria/react';
import { up, useIsMobile } from '@p2p-wallet-web/ui';
import type { Token } from '@saberhq/token-utils';

import { Hint } from 'components/pages/receive/ReceiveTokensWidget/common/Hint';

import { TokenRow } from './TokenRow';

const Wrapper = styled.div`
  height: 600px;
  overflow-y: auto;

  ${up.tablet} {
    height: 300px;
  }
`;

const Container = styled.div``;

interface Props {
  tokens: readonly Token[];
}

export const TokenList: FC<Props> = ({ tokens }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const rowVirtualizer = useVirtual({
    paddingStart: 0,
    paddingEnd: 8,
    size: tokens.length,
    parentRef,
    overscan: 6,
  });

  const renderRow = (virtualRow: VirtualItem) => {
    if (isMobile && virtualRow.index === 0) {
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

    const index = isMobile ? virtualRow.index - 1 : virtualRow.index;

    return (
      <TokenRow
        ref={virtualRow.measureRef}
        key={index}
        token={tokens[index]!}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          transform: `translateY(${virtualRow.start}px)`,
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
