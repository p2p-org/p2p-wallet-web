import React, { FC } from 'react';

import { useSwap } from 'app/contexts/swap';

import { SwapTokenForm } from '../SwapTokenForm';

interface Props {
  className?: string;
}

export const SwapToForm: FC<Props> = ({ className }) => {
  const { toMint, setToMint, toAmount, setToAmount } = useSwap();

  return (
    <SwapTokenForm
      from={false}
      mint={toMint}
      setMint={setToMint}
      amount={toAmount}
      setAmount={setToAmount}
      className={className}
    />
  );
};
