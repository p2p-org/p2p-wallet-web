import { useMemo } from 'react';

import { u64 } from '@solana/spl-token';

import { useNetworkFees } from 'app/contexts';

type FeesType = {
  transactionFee: u64;
  totalFee: u64;
};

export const useFeeCalculation = () => {
  const { lamportsPerSignature } = useNetworkFees();

  const signatureAmount = 1;

  const fees = useMemo<FeesType>(() => {
    const transactionFee = lamportsPerSignature.mul(new u64(signatureAmount));
    return { transactionFee, totalFee: transactionFee };
  }, [signatureAmount, lamportsPerSignature]);

  return fees;
};
