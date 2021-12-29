import type { FunctionComponent } from 'react';
import Skeleton from 'react-loading-skeleton';

import type { CSSProperties } from '@linaria/core';
import { styled } from '@linaria/react';
import type { TokenAmount } from '@saberhq/token-utils';

import { useMarketData } from 'app/contexts';

const Wrapper = styled.div``;

type Props = {
  prefix?: string;
  value: TokenAmount;
  style?: CSSProperties;
  className?: string;
};

export const AmountUSD: FunctionComponent<Props> = ({ prefix, value, ...props }) => {
  const rate = useMarketData(value.token.symbol);

  if (!rate.loading && !rate.data) {
    return null;
  }

  return (
    <Wrapper title="Amount in USD" {...props}>
      {rate.loading ? (
        <Skeleton width={50} />
      ) : rate.data ? (
        <>
          {prefix ? `${prefix} ` : undefined}
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
            value.asNumber * rate.data,
          )}
        </>
      ) : undefined}
    </Wrapper>
  );
};
