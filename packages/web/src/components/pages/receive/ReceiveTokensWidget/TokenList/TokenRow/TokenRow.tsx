import type { FC, HTMLAttributes } from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import type { Token } from '@saberhq/token-utils';

import { TokenAvatar } from 'components/common/TokenAvatar';

import { TOKEN_ROW_HEIGHT } from './constants';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  height: ${TOKEN_ROW_HEIGHT}px;
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

interface Props extends HTMLAttributes<HTMLDivElement> {
  token: Token;
}

export const TokenRow: FC<Props> = ({ token, style }) => {
  return (
    <Wrapper style={style}>
      <TokenAvatar token={token} size="32" />
      <Name>{token.name}</Name>
      <Symbol>{token.symbol}</Symbol>
    </Wrapper>
  );
};
