import type { FunctionComponent, ReactElement } from 'react';
import Skeleton from 'react-loading-skeleton';

import type { CSSProperties } from '@linaria/core';
import { styled } from '@linaria/react';
import type { TokenAmount } from '@p2p-wallet-web/token-utils';

import { useMarketData } from 'app/contexts';
import { formatNumberToUSD } from 'utils/format';

const Wrapper = styled.div``;

type Props = {
  prefix?: ReactElement | string;
  postfix?: ReactElement | string;
  value?: TokenAmount;
  style?: CSSProperties;
  className?: string;
};

export const AmountUSD: FunctionComponent<Props> = ({ prefix, postfix, value, ...props }) => {
  const rate = useMarketData(value?.token.symbol);

  if (!rate.loading && !rate.data) {
    return null;
  }

  return (
    <Wrapper title="Amount in USD" {...props}>
      {rate.loading ? (
        <Skeleton width={50} />
      ) : rate.data ? (
        <>
          {prefix}
          {formatNumberToUSD((value?.asNumber || 0) * rate.data)}
          {postfix}
        </>
      ) : null}
    </Wrapper>
  );
};
