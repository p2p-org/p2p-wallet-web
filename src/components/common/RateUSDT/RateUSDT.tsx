import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';

import { rateSelector } from 'store/selectors/rates';

const Wrapper = styled.div``;

type Props = {
  symbol?: string;
};

export const RateUSDT: FunctionComponent<Props> = ({ symbol = '', ...props }) => {
  const rate = useSelector(rateSelector(symbol));

  if (!rate) {
    return null;
  }

  return (
    <Wrapper title="Rate in USDT" {...props}>
      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rate)}
    </Wrapper>
  );
};
