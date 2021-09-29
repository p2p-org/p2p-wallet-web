import React, { FC } from 'react';

import { SOL_MINT, useSwap } from 'app/contexts/swap';

// import { SwapButtonFeeRelayer } from './SwapButtonFeeRelayer';
import { SwapButtonOriginal } from './SwapButtonOriginal';

export const SwapButton: FC = () => {
  const { fromMint } = useSwap();

  const isSol = fromMint.equals(SOL_MINT);

  if (isSol) {
    return <SwapButtonOriginal />;
  }

  return <SwapButtonOriginal />;
  // return <SwapButtonFeeRelayer />;
};
