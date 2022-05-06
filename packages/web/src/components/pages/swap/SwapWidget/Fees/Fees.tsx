import type { FC } from 'react';

import { useUserTokenAccounts } from '@p2p-wallet-web/core';

import { useFeeCompensation, useFreeFeeLimits, useNetworkFees } from 'app/contexts';
import { useSwap } from 'app/contexts/solana/swap';

import { FeesOriginal } from './FeesOriginal';

export const Fees: FC = () => {
  const swapInfo = useSwap();
  const userTokenAccounts = useUserTokenAccounts();
  const feeCompensationInfo = useFeeCompensation();
  const feeLimitsInfo = useFreeFeeLimits();
  const networkFees = useNetworkFees();

  if (!swapInfo.trade.derivedFields) {
    return null;
  }

  return (
    <FeesOriginal
      swapInfo={swapInfo}
      forPage={true}
      userTokenAccounts={userTokenAccounts}
      feeCompensationInfo={feeCompensationInfo}
      feeLimitsInfo={feeLimitsInfo}
      networkFees={networkFees}
    />
  );
};
