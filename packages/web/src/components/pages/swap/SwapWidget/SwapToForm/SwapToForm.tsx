import type { FC } from 'react';

import { useSwap } from 'app/contexts/solana/swap';

import { SwapTokenForm } from '../SwapTokenForm';

interface Props {
  className?: string;
}

export const SwapToForm: FC<Props> = ({ className }) => {
  const { trade, setOutputTokenName, setOutputAmount, outputTokenAmount } = useSwap();

  return (
    <SwapTokenForm
      trade={trade}
      tokenName={trade.outputTokenName}
      setTokenName={setOutputTokenName}
      pairTokenName={trade.inputTokenName}
      amount={trade.getOutputAmount()}
      setAmount={setOutputAmount}
      maxAmount={outputTokenAmount}
      className={className}
    />
  );
};
