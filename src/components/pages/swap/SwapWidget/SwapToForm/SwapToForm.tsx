import React, { FC } from 'react';

import { useSwapContext } from '@project-serum/swap-ui';

import { SwapTokenForm } from '../SwapTokenForm';

interface Props {
  className?: string;
}

export const SwapToForm: FC<Props> = ({ className }) => {
  const { toMint, setToMint, toAmount, setToAmount } = useSwapContext();
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
