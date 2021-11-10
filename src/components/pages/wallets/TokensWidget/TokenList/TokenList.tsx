import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';

import { TokenAccount } from 'api/token/TokenAccount';
import { LoaderBlock } from 'components/common/LoaderBlock';

import { TokenRow } from '../TokenRow';

const Wrapper = styled.div`
  margin: 0 10px;
`;

const sortByRules = (rates: { [pair: string]: number }) => (a: TokenAccount, b: TokenAccount) => {
  if (a.mint.symbol === 'SOL' || b.mint.symbol === 'SOL') {
    return a.mint.symbol === 'SOL' ? -1 : 1;
  }

  if (!a.mint.symbol || !b.mint.symbol) {
    return !a.mint.symbol ? 1 : -1;
  }

  if (a.mint.symbol && b.mint.symbol) {
    if (rates[a.mint.symbol] && rates[b.mint.symbol]) {
      const aUSDBalance = a.balance.toNumber() * rates[a.mint.symbol];
      const bUSDBalance = b.balance.toNumber() * rates[b.mint.symbol];

      if (aUSDBalance !== bUSDBalance) {
        return aUSDBalance > bUSDBalance ? -1 : 1;
      }
    }

    if (rates[a.mint.symbol] && !rates[b.mint.symbol]) {
      return -1;
    }

    if (!rates[a.mint.symbol] && rates[b.mint.symbol]) {
      return 1;
    }
  }

  const aBalance = a.mint.toMajorDenomination(a.balance);
  const bBalance = b.mint.toMajorDenomination(b.balance);
  if (!aBalance.eq(bBalance)) {
    return aBalance.gt(bBalance) ? -1 : 1;
  }

  if (a.mint.symbol && b.mint.symbol && a.mint.symbol !== b.mint.symbol) {
    return a.mint.symbol < b.mint.symbol ? -1 : 1;
  }

  return a.mint.address < b.mint.address ? -1 : 1;
};

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
