import React, { FC } from 'react';

import { useSwap } from 'app/contexts/swap';

import { SwapTokenForm } from '../SwapTokenForm';

interface Props {
  className?: string;
}

export const SwapToForm: FC<Props> = ({ className }) => {
  const { trade, setOutputTokenName, setOutputAmount, outputTokenPrice } = useSwap();

  return (
    <SwapTokenForm
      trade={trade}
      tokenName={trade.outputTokenName}
      setTokenName={setOutputTokenName}
      pairTokenName={trade.inputTokenName}
      amount={trade.getOutputAmount()}
      setAmount={setOutputAmount}
      price={outputTokenPrice}
      className={className}
    />
  );
};
