import type { FC } from 'react';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';

const Wrapper = styled.div``;

interface Props {
  tokenAccount: TokenAccount;
}

export const TokenAccountRow: FC<Props> = ({ tokenAccount }) => {
  if (tokenAccount.loading) {
    return <>Loading</>;
  }

  if (tokenAccount.balance && tokenAccount.key) {
    return (
      <Wrapper>
        <img alt="" width={40} src={tokenAccount.balance.token.icon} />
        {tokenAccount.balance.token.symbol}
        {tokenAccount.balance.toExact()}
        {tokenAccount.key.toBase58()}
      </Wrapper>
    );
  }

  return <Wrapper>{tokenAccount.balance?.token.address}</Wrapper>;
};
