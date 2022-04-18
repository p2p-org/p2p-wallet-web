import type { FunctionComponent, ReactElement } from 'react';
import { useEffect, useState } from 'react';

import type { CSSProperties } from '@linaria/core';
import { styled } from '@linaria/react';
import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';

import { useConfig, usePrice } from 'app/contexts/solana/swap';
import { getUSDValue } from 'app/contexts/solana/swap/utils/format';
import { formatNumberToUSD } from 'components/utils/format';

const Wrapper = styled.div``;

type Props = {
  amount?: u64;
  tokenName?: string;
  style?: CSSProperties;
  className?: string;
  prefix?: ReactElement | string;
};

export const AmountUSD: FunctionComponent<Props> = ({
  amount = new u64(0),
  tokenName = '',
  prefix,
  ...props
}) => {
  const { tokenConfigs } = useConfig();
  const [usdValue, setUSDValue] = useState('');

  const { useAsyncMergedPrices } = usePrice();
  const asyncPrices = useAsyncMergedPrices();
  const price = asyncPrices.value?.[tokenName];

  useEffect(() => {
    if (amount.eq(ZERO) || !price) {
      setUSDValue('');
      return;
    }

    setUSDValue(formatNumberToUSD(getUSDValue(amount, tokenConfigs[tokenName].decimals, price)));
  }, [tokenName, price, amount, tokenConfigs]);

  return (
    <Wrapper title="Amount in USD" {...props}>
      {prefix}
      {usdValue}
    </Wrapper>
  );
};
