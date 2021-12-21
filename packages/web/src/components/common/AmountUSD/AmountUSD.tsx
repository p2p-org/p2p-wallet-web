import type { FunctionComponent } from 'react';
import React from 'react';

import type { CSSProperties } from '@linaria/core';
import { styled } from '@linaria/react';
import { useMarketRate } from '@p2p-wallet-web/core';
import type { TokenAmount } from '@saberhq/token-utils';

const Wrapper = styled.div``;

type Props = {
  prefix?: string;
  value: TokenAmount;
  style?: CSSProperties;
  className?: string;
};

export const AmountUSD: FunctionComponent<Props> = ({ prefix, value, ...props }) => {
  const rate = useMarketRate(value.token.symbol.toUpperCase());

  if (!rate) {
    return null;
  }

  return (
    <Wrapper title="Amount in USD" {...props}>
      {prefix ? `${prefix} ` : undefined}
      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
        value.asNumber * rate,
      )}
    </Wrapper>
  );
};
