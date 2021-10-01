import React, { FC } from 'react';

import { useSwap } from 'app/contexts/swap';
import { useMinOrder } from 'app/contexts/swap/dex';

import { SwapTokenForm } from '../SwapTokenForm';

interface Props {
  className?: string;
}

export const SwapFromForm: FC<Props> = ({ className }) => {
  const { fromMint, setFromMint, fromAmount, setFromAmount } = useSwap();
  const { minOrderSize } = useMinOrder();

  return (
    <SwapTokenForm
      from
      mint={fromMint}
      setMint={setFromMint}
      amount={fromAmount}
      setAmount={setFromAmount}
      minOrderSize={minOrderSize}
      className={className}
    />
  );
};
