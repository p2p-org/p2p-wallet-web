import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { styled } from 'linaria/react';

const Wrapper = styled.div``;

type Props = {
  symbol?: string;
};

export const RateUSDT: FunctionComponent<Props> = ({ symbol = '', ...props }) => {
  const rate = 1; // useSelector((state: RootState) => state.rates[`${symbol}/USDT`]);

  return (
    <Wrapper title="Rate in USDT" {...props}>
      {rate
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rate)
        : undefined}
    </Wrapper>
  );
};
