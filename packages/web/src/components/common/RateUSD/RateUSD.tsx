import type { FunctionComponent } from 'react';
import React from 'react';

import { styled } from '@linaria/react';
import { useMarketRate } from '@p2p-wallet-web/core';

const Wrapper = styled.div``;

type Props = {
  symbol?: string;
};

export const RateUSD: FunctionComponent<Props> = ({ symbol = '', ...props }) => {
  const rate = useMarketRate(symbol.toUpperCase());

  if (!rate) {
    return null;
  }

  return (
    <Wrapper title="Rate in USD" {...props}>
      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rate)}
    </Wrapper>
  );
};
