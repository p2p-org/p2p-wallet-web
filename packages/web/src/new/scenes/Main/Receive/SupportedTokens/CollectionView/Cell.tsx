import type { FC, HTMLAttributes } from 'react';
import { forwardRef } from 'react';
import * as React from 'react';
import Skeleton from 'react-loading-skeleton';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';

import type { Token } from 'new/sdk/SolanaSDK';
import { TokenAvatar } from 'new/ui/components/common/TokenAvatar';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  height: 48px;
  padding: 8px;

  color: ${theme.colors.textIcon.primary};
  line-height: 150%;
  letter-spacing: 0.005em;
  font-feature-settings: 'tnum' on, 'lnum' on;
`;

const Name = styled.div`
  flex: 1;
  margin-left: 8px;

  font-weight: 500;
  font-size: 14px;
`;

const Symbol = styled.div`
  font-weight: bold;
  font-size: 14px;
`;

const AVATAR_SIZE = 32;

interface Props extends HTMLAttributes<HTMLDivElement> {
  token?: Token;
  isPlaceholder?: boolean;
  forwardedRef?: React.Ref<HTMLDivElement>;
}

const CellOrigin: FC<Props> = ({ forwardedRef, token, isPlaceholder, style }) => {
  if (isPlaceholder) {
    return (
      <Wrapper>
        <Skeleton height={AVATAR_SIZE} width={AVATAR_SIZE} borderRadius={12} />
        <Name>
          <Skeleton width={100} height={16} />
        </Name>
        <Symbol>
          <Skeleton width={100} height={16} />
        </Symbol>
      </Wrapper>
    );
  }

  const renderName = (token?: Token) => {
    if (token?.symbol === 'SOL') {
      return 'Solana';
    }

    return token?.name ?? '';
  };

  return (
    <Wrapper ref={forwardedRef} style={style}>
      <TokenAvatar token={token} size={AVATAR_SIZE} />
      <Name>{renderName(token)}</Name>
      <Symbol>{token?.symbol}</Symbol>
    </Wrapper>
  );
};

export const Cell = forwardRef<HTMLDivElement, Props>((props, ref) => (
  <CellOrigin {...props} forwardedRef={ref} />
));
