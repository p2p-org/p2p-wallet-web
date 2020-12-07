import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { styled } from '@linaria/react';

import { RootState } from 'store/rootReducer';

const Wrapper = styled.div``;

type Props = {
  symbol?: string;
};

export const RateUSDT: FunctionComponent<Props> = ({ symbol = '', ...props }) => {
  const rate = useSelector((state: RootState) => state.rate[`${symbol}/USDT`]);

  if (!rate) {
    return null;
  }

  return (
    <Wrapper title="Rate in USDT" {...props}>
      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rate)}
    </Wrapper>
  );
};
