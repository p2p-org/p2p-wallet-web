import type { FC } from 'react';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';

import { TokenAccountRowContent } from 'components/common/TokenAccountRowContent';

const Wrapper = styled.div`
  margin: 26px 26px;
  display: flex;
  align-items: center;
`;

interface Props {
  tokenAccount: TokenAccount;
  onClick: () => void;
}

export const ActionRow: FC<Props> = ({ tokenAccount, onClick }) => {
  return (
    <Wrapper onClick={onClick}>
      <TokenAccountRowContent tokenAccount={tokenAccount} />
    </Wrapper>
  );
};
