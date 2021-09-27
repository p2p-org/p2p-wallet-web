import React, { FC } from 'react';

import { SOL_MINT, useSwapContext } from '@project-serum/swap-ui';

// import { SwapButtonFeeRelayer } from './SwapButtonFeeRelayer';
import { SwapButtonOriginal } from './SwapButtonOriginal';

export const SwapButton: FC = () => {
  const { fromMint } = useSwapContext();

  const isSol = fromMint.equals(SOL_MINT);

  if (isSol) {
    return <SwapButtonOriginal />;
  }

  return <SwapButtonOriginal />;
  // return <SwapButtonFeeRelayer />;
};
