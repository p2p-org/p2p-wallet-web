import type { FC } from 'react';

import { useSwap } from 'app/contexts/solana/swap';

import { SwapTokenForm } from '../SwapTokenForm';

interface Props {
  className?: string;
}

export const SwapFromForm: FC<Props> = ({ className }) => {
  const { trade, setInputTokenName, setInputAmount, inputTokenAmount } = useSwap();

  return (
    <SwapTokenForm
      trade={trade}
      isInput
      tokenName={trade.inputTokenName}
      setTokenName={setInputTokenName}
      pairTokenName={trade.outputTokenName}
      amount={trade.getInputAmount()}
      setAmount={setInputAmount}
      maxAmount={inputTokenAmount}
      className={className}
    />
  );
};
