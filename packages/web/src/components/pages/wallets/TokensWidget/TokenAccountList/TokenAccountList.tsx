import type { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';

import { LoaderBlock } from 'components/common/LoaderBlock';
import { useSortedTokens } from 'components/pages/wallets/TokensWidget/TokenAccountList/hooks/useSortedTokens';

import { TokenAccountRow } from '../TokenAccountRow';

const Wrapper = styled.div`
  margin: 0 10px;
`;

type Props = {
  items: TokenAccount[];
  selectedSymbol: string;
  isHidden?: boolean;
};

export const TokenAccountList: FunctionComponent<Props> = ({
  items = [],
  selectedSymbol,
  isHidden = false,
}) => {
  const tokenAccounts = useSortedTokens(items);

  if (tokenAccounts.length === 0 && !isHidden) {
    return <LoaderBlock />;
  }

  return (
    <Wrapper>
      {tokenAccounts.map((item) => (
        <TokenAccountRow
          key={item.key.toBase58()}
          tokenAccount={item}
          isSelected={item.balance?.token.symbol === selectedSymbol}
          isHidden={isHidden}
        />
      ))}
    </Wrapper>
  );
};
