import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { CSSProperties } from '@linaria/core';
import { styled } from '@linaria/react';
import { Decimal } from 'decimal.js';

import { rateSelector } from 'store/selectors/rates';

const Wrapper = styled.div``;

type Props = {
  prefix?: string;
  value?: Decimal;
  symbol?: string;
  style?: CSSProperties;
  className?: string;
};

export const AmountUSD: FunctionComponent<Props> = ({
  prefix,
  value = new Decimal(0),
  symbol = '',
  ...props
}) => {
  const rate = useSelector(rateSelector(symbol));

  if (!rate) {
    return null;
  }

  return (
    <Wrapper title="Amount in USD" {...props}>
      {prefix ? `${prefix} ` : undefined}
      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
        value.times(rate).toNumber(),
      )}
    </Wrapper>
  );
};
