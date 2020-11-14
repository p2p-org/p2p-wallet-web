import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { styled } from 'linaria/react';

import { RootState } from 'store/types';

const Wrapper = styled.div``;

type Props = {
  value?: number | string;
  symbol?: string;
};

export const AmountUSDT: FunctionComponent<Props> = ({ value = 0, symbol = '', ...props }) => {
  const rate = useSelector((state: RootState) => state.entities.rates[`${symbol}/USDT`]);

  let sum;

  if (rate) {
    sum = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      Number.parseFloat(value as string) * rate,
    );
  } else {
    sum = value;
  }

  return <Wrapper {...props}>{sum}</Wrapper>;
};
