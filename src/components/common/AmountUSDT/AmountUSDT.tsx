import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { Decimal } from 'decimal.js';
import { styled } from 'linaria/react';

import { RootState } from 'store/rootReducer';

const Wrapper = styled.div``;

type Props = {
  value?: Decimal;
  symbol?: string;
};

export const AmountUSDT: FunctionComponent<Props> = ({
  value = new Decimal(0),
  symbol = '',
  ...props
}) => {
  const rate = 1; // useSelector((state: RootState) => state.rates[`${symbol}/USDT`]);

  let sum = String(value);

  if (rate) {
    sum = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      value.times(rate).toNumber(),
    );
  }

  return (
    <Wrapper title="Amount in USDT" {...props}>
      {sum}
    </Wrapper>
  );
};
