import type { FunctionComponent } from 'react';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';

import type { TokenAccount } from 'api/token/TokenAccount';
import { LoaderBlock } from 'components/common/LoaderBlock';
import { sortByRules } from 'utils/sort';

import { TokenRow } from '../TokenRow';

const Wrapper = styled.div`
  margin: 0 10px;
`;

type Props = {
  items: TokenAccount[];
  selectedSymbol: string;
  isZeroBalancesHidden?: boolean;
  isHidden?: boolean;
};

export const TokenList: FunctionComponent<Props> = ({
  items = [],
  selectedSymbol,
  isZeroBalancesHidden = true,
  isHidden = false,
}) => {
  const rates = useSelector((state) => state.rate.markets);

  const tokens = useMemo(() => {
    return items.sort(sortByRules(rates));
  }, [items, rates]);

  if (tokens.length === 0 && !isHidden) {
    return <LoaderBlock />;
  }

  return (
    <Wrapper>
      {tokens.map((item) => (
        <TokenRow
          key={item.address.toBase58()}
          token={item}
          isSelected={item.mint.symbol === selectedSymbol}
          isHidden={isHidden}
          isZeroBalancesHidden={isZeroBalancesHidden}
        />
      ))}
    </Wrapper>
  );
};
