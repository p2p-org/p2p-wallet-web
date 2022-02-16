import type { FunctionComponent } from 'react';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { up } from '@p2p-wallet-web/ui';

import { LoaderBlock } from 'components/common/LoaderBlock';
import { useSortedTokens } from 'components/pages/home/TokensWidget/TokenAccountList/hooks/useSortedTokens';

import { TokenAccountRow } from './TokenAccountRow';

const Wrapper = styled.div`
  display: grid;
  grid-gap: 8px;

  ${up.tablet} {
    grid-gap: 16px;
    margin: initial;
  }
`;

type Props = {
  items: TokenAccount[];
  isHidden?: boolean;
};

export const TokenAccountList: FunctionComponent<Props> = ({ items = [], isHidden = false }) => {
  const tokenAccounts = useSortedTokens(items);

  if (tokenAccounts.length === 0 && !isHidden) {
    return <LoaderBlock />;
  }

  return (
    <Wrapper>
      {tokenAccounts.map(
        (item) =>
          item.key && (
            <TokenAccountRow key={item.key.toBase58()} tokenAccount={item} isHidden={isHidden} />
          ),
      )}
    </Wrapper>
  );
};
