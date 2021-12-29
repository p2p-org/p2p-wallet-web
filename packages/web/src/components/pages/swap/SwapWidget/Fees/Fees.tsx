import type { FC } from 'react';

import { useSwap } from 'app/contexts/solana/swap';

import { FeesOriginal } from './FeesOriginal';

export const Fees: FC = () => {
  const { trade } = useSwap();

  if (!trade.derivedFields) {
    return null;
  }

  const isSol = trade.inputTokenName === 'SOL';

  return isSol ? <FeesOriginal /> : <FeesOriginal />;
};
