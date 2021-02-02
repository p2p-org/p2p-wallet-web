import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { CSSProperties } from '@linaria/core';
import { styled } from '@linaria/react';
import { Decimal } from 'decimal.js';

import { RootState } from 'store/rootReducer';

const Wrapper = styled.div``;

type Props = {
  prefix?: string;
  value?: Decimal;
  symbol?: string;
  style?: CSSProperties;
  className?: string;
};

export const AmountUSDT: FunctionComponent<Props> = ({
  prefix,
  value = new Decimal(0),
  symbol = '',
  ...props
}) => {
  const rate = useSelector((state: RootState) => state.rate.markets[`${symbol}/USDT`]);

  if (!rate && !['USDT', 'USDC'].includes(symbol)) {
    return null;
  }

  const calculatedValue = useMemo(() => {
    return value.times(rate || 1).toNumber();
  }, [rate, value?.toNumber()]);

  return (
    <Wrapper title="Amount in USDT" {...props}>
      {prefix ? `${prefix} ` : undefined}
      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
        calculatedValue,
      )}
    </Wrapper>
  );
};
