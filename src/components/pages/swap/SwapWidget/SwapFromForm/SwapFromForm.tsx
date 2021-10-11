import React, { FC } from 'react';

import { useSwap } from 'app/contexts/swap';

import { SwapTokenForm } from '../SwapTokenForm';

interface Props {
  className?: string;
}

export const SwapFromForm: FC<Props> = ({ className }) => {
  const { trade, setInputTokenName, setInputAmount } = useSwap();

  return (
    <SwapTokenForm
      isInput
      tokenName={trade.inputTokenName}
      setTokenName={setInputTokenName}
      pairTokenName={trade.outputTokenName}
      amount={trade.getInputAmount()}
      setAmount={setInputAmount}
      className={className}
    />
  );
};
