import type { FC } from 'react';

import { useFeeCompensation, useNetworkFees } from 'app/contexts';
import { useSwap } from 'app/contexts/solana/swap';

import { FeesOriginal } from './FeesOriginal';

export const Fees: FC = () => {
  const swapInfo = useSwap();
  const feeCompensationInfo = useFeeCompensation();
  const networkFees = useNetworkFees();

  if (!swapInfo.trade.derivedFields) {
    return null;
  }

  return (
    <FeesOriginal
      swapInfo={swapInfo}
      forPage={true}
      feeCompensationInfo={feeCompensationInfo}
      networkFees={networkFees}
    />
  );
};
