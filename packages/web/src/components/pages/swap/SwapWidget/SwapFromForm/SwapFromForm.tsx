import type { FC } from 'react';

import { ZERO } from '@orca-so/sdk';

import { useSwap } from 'app/contexts/solana/swap';

import { SwapTokenForm } from '../SwapTokenForm';

interface Props {
  className?: string;
}

export const SwapFromForm: FC<Props> = ({ className }) => {
  const { trade, setInputTokenName, setInputAmount, inputTokenAmount, feeAmount } = useSwap();

  let maxAmout = inputTokenAmount;
  if (feeAmount) {
    const balanceSubstractFee = inputTokenAmount?.sub(feeAmount);
    maxAmout = balanceSubstractFee?.gt(ZERO) ? balanceSubstractFee : ZERO;
  }

  return (
    <SwapTokenForm
      trade={trade}
      isInput
      tokenName={trade.inputTokenName}
      setTokenName={setInputTokenName}
      pairTokenName={trade.outputTokenName}
      amount={trade.getInputAmount()}
      setAmount={setInputAmount}
      maxAmount={maxAmout}
      isFeeSubtracted={!!feeAmount}
      className={className}
    />
  );
};
