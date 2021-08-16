import React, { FC } from 'react';

import { useSwapContext } from '@project-serum/swap-ui';

import { SwapTokenForm } from '../SwapTokenForm';

interface Props {
  className?: string;
}

export const SwapFromForm: FC<Props> = ({ className }) => {
  const { fromMint, setFromMint, fromAmount, setFromAmount } = useSwapContext();
  return (
    <SwapTokenForm
      from
      mint={fromMint}
      setMint={setFromMint}
      amount={fromAmount}
      setAmount={setFromAmount}
      className={className}
    />
  );
};
