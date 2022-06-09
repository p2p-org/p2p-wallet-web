import { useMemo } from 'react';

import { ZERO } from '@orca-so/sdk';
import { useNativeAccount } from '@p2p-wallet-web/sail';
import { u64 } from '@solana/spl-token';

import { useNetworkFees, useSendState } from 'app/contexts';

type FeesType = {
  transactionFee: u64;
  accountCreationFee: u64;
  totalFee: u64;
  isInsufficientFundsForFee: boolean;
};

export const useFeeCalculation = () => {
  const { lamportsPerSignature, accountRentExemption, solAccountRentExemption } = useNetworkFees();
  const { isRawSOL, destinationAccount, parsedAmount } = useSendState();
  const { nativeBalance } = useNativeAccount();

  const signatureAmount = 1;

  const fees = useMemo<FeesType>(() => {
    const transactionFee = lamportsPerSignature.mul(new u64(signatureAmount));

    let accountCreationFee = ZERO;
    if (!isRawSOL && destinationAccount?.isNeedCreate) {
      accountCreationFee = accountRentExemption;
    }

    const totalFee = transactionFee.add(accountCreationFee);

    const balanceRest = nativeBalance?.toU64().sub(totalFee);

    if (isRawSOL) {
      balanceRest?.isub(parsedAmount?.toU64() || ZERO);
    } else {
      balanceRest?.isub(solAccountRentExemption);
    }

    const isInsufficientFundsForFee = balanceRest?.lt(ZERO) || false;

    return {
      transactionFee,
      accountCreationFee,
      totalFee,
      isInsufficientFundsForFee,
    };
  }, [
    signatureAmount,
    lamportsPerSignature,
    accountRentExemption,
    solAccountRentExemption,
    isRawSOL,
    destinationAccount?.isNeedCreate,
    nativeBalance,
    parsedAmount,
  ]);

  return fees;
};
