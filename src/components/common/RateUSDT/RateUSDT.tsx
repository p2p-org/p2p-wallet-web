import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { styled } from 'linaria/react';

import { RootState } from 'store/types';

const Wrapper = styled.div``;

type Props = {
  symbol?: string;
};

export const RateUSDT: FunctionComponent<Props> = ({ symbol = '', ...props }) => {
  const rate = useSelector((state: RootState) => state.entities.rates[`${symbol}/USDT`]);

  return (
    <Wrapper {...props}>
      {rate
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rate)
        : undefined}
    </Wrapper>
  );
};
