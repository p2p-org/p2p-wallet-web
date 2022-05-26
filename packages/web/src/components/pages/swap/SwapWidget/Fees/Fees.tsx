import type { FC } from 'react';

import { useSwap } from 'app/contexts/solana/swap';

import { FeesOriginal } from './FeesOriginal';

export const Fees: FC = () => {
  const swapInfo = useSwap();

  if (!swapInfo.trade.derivedFields) {
    return null;
  }

  return <FeesOriginal swapInfo={swapInfo} forPage={true} />;
};
