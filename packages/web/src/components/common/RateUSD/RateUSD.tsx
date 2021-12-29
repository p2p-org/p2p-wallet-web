import type { FunctionComponent } from 'react';
import Skeleton from 'react-loading-skeleton';

import { styled } from '@linaria/react';

import { useMarketData } from 'app/contexts';

const Wrapper = styled.div``;

type Props = {
  symbol?: string;
};

export const RateUSD: FunctionComponent<Props> = ({ symbol = '', ...props }) => {
  const rate = useMarketData(symbol);

  if (!rate.loading && !rate.data) {
    return null;
  }

  return (
    <Wrapper title="Rate in USD" {...props}>
      {rate.loading ? (
        <Skeleton width={50} />
      ) : rate.data ? (
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rate.data)
      ) : undefined}
    </Wrapper>
  );
};
