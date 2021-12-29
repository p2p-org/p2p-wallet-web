import type { FC } from 'react';

import { styled } from '@linaria/react';
import { useUserTokenAccounts } from '@p2p-wallet-web/core';

import { TokenAccountRow } from './TokenAccountRow';

const Wrapper = styled.div``;

export const TokenAccountsList: FC = () => {
  const tokenAccounts = useUserTokenAccounts();

  if (!tokenAccounts) {
    return null;
  }

  return (
    <Wrapper>
      {tokenAccounts
        .map((t) => t)
        .sort((a, b) => {
          if (!a.balance && b.balance) {
            return 1;
          } else if (a.balance && !b.balance) {
            return -1;
          } else if (a.balance && b.balance) {
            return a.balance.greaterThan(b.balance) ? -1 : 1;
          }

          return 0;
        })
        .map((tokenAccount) => (
          <TokenAccountRow key={tokenAccount.key?.toBase58()} tokenAccount={tokenAccount} />
        ))}
    </Wrapper>
  );
};
