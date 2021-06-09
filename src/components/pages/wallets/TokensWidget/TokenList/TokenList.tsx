import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';

import { TokenAccount } from 'api/token/TokenAccount';
import { LoaderBlock } from 'components/common/LoaderBlock';

import { TokenRow } from '../TokenRow';

const Wrapper = styled.div`
  margin: 0 10px;
`;

const sortByUSDBalance = (rates: { [pair: string]: number }) => (
  a: TokenAccount,
  b: TokenAccount,
) => {
  if (a.mint.symbol && !rates[a.mint.symbol]) {
    return 1;
  }
  if (b.mint.symbol && !rates[b.mint.symbol]) {
    return -1;
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const aUSDBalance = a.balance.toNumber() * rates[a.mint.symbol!];
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const bUSDBalance = b.balance.toNumber() * rates[b.mint.symbol!];

  if (aUSDBalance < bUSDBalance) {
    return 1;
  }

  if (aUSDBalance === bUSDBalance) {
    if (a.balance.lt(b.balance)) {
      return 1;
    }

    return 0;
  }

  return -1;
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

  const tokens = useMemo(() => items.sort(sortByUSDBalance(rates)), [items, rates]);

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
