import type { FC } from 'react';

import { styled } from '@linaria/react';
import type { SwapTransaction, Transaction } from '@p2p-wallet-web/core';
import { useTokenAccount } from '@p2p-wallet-web/core';
import { usePubkey } from '@p2p-wallet-web/sail';

import { TokenAvatar } from 'components/common/TokenAvatar';

import { BaseWrapper } from '../../common/styled';

const Wrapper = styled(BaseWrapper)`
  position: relative;

  & > :nth-child(1) {
    position: absolute;
    top: 0;
    left: 0;
  }

  & > :nth-child(2) {
    position: absolute;
    right: 0;
    bottom: 0;
  }
`;

interface Props {
  transaction: Transaction<SwapTransaction>;
}

export const SwapAvatars: FC<Props> = ({ transaction }) => {
  const sourceTokenAccount = useTokenAccount(usePubkey(transaction.data?.source));
  const destinationTokenAccount = useTokenAccount(usePubkey(transaction.data?.destination));

  return (
    <Wrapper>
      <TokenAvatar
        symbol={sourceTokenAccount?.balance?.token.symbol}
        address={sourceTokenAccount?.balance?.token.address}
        size={32}
      />
      <TokenAvatar
        symbol={destinationTokenAccount?.balance?.token.symbol}
        address={destinationTokenAccount?.balance?.token.address}
        size={32}
      />
    </Wrapper>
  );
};
