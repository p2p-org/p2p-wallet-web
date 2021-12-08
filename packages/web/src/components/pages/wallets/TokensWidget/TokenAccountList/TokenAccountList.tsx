import type { FunctionComponent } from 'react';
import React, { useMemo } from 'react';

import { styled } from '@linaria/react';
import type { TokenAccount } from '@p2p-wallet-web/core';
import { useRates } from '@p2p-wallet-web/core';

import { LoaderBlock } from 'components/common/LoaderBlock';
import { sortByRules } from 'utils/sort';

import { TokenAccountRow } from '../TokenAccountRow';

const Wrapper = styled.div`
  margin: 0 10px;
`;

type Props = {
  items: TokenAccount[];
  selectedSymbol: string;
  isZeroBalancesHidden?: boolean;
  isHidden?: boolean;
};

export const TokenAccountList: FunctionComponent<Props> = ({
  items = [],
  selectedSymbol,
  isZeroBalancesHidden = true,
  isHidden = false,
}) => {
  const { markets: rates } = useRates();

  const tokens = useMemo(() => {
    return items.sort(sortByRules(rates));
  }, [items, rates]);

  if (tokens.length === 0 && !isHidden) {
    return <LoaderBlock />;
  }

  return (
    <Wrapper>
      {tokens.map((item) => (
        <TokenAccountRow
          key={item.key.toBase58()}
          tokenAccount={item}
          isSelected={item.balance?.token.symbol === selectedSymbol}
          isHidden={isHidden}
          isZeroBalancesHidden={isZeroBalancesHidden}
        />
      ))}
    </Wrapper>
  );
};
