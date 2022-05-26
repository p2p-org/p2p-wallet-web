import type { FC } from 'react';

import { useFeeCompensation, useSendState } from 'app/contexts';

import { SendButtonBitcoin } from './SendButtonBitcoin';
import { SendButtonSolana } from './SendButtonSolana';

const isValidAmount = (amount: string): boolean => {
  const amountValue = Number.parseFloat(amount);

  return amount === '' || amountValue === 0;
};

export const SendButton: FC = () => {
  const {
    fromAmount,
    fromTokenAccount,
    blockchain,
    destinationAddress,
    isExecuting,
    isAddressInvalid,
    setIsInitBurnAndRelease,
    isAddressNotMatchNetwork,
  } = useSendState();
  const { estimatedFeeAmount } = useFeeCompensation();

  const feeSolTokenAmount = estimatedFeeAmount.accountsCreation.sol;
  const feeAmount = feeSolTokenAmount?.asNumber;
  const isSPLPayed = 'SOL' === fromTokenAccount?.balance?.token?.symbol;
  const tokenBalance = fromTokenAccount?.balance?.asNumber;
  const maxAllowedAmount = isSPLPayed ? tokenBalance - Number(feeAmount) : tokenBalance;

  const hasBalance = fromTokenAccount?.balance ? maxAllowedAmount >= Number(fromAmount) : false;

  const isDisabledButton =
    isExecuting ||
    !destinationAddress ||
    isValidAmount(fromAmount) ||
    isAddressInvalid ||
    isAddressNotMatchNetwork ||
    !hasBalance;

  if (blockchain === 'bitcoin') {
    return (
      <SendButtonBitcoin
        primary={!isExecuting}
        disabled={isDisabledButton}
        onInitBurnAndRelease={() => setIsInitBurnAndRelease(true)}
      />
    );
  }

  return <SendButtonSolana primary={!isExecuting} disabled={isDisabledButton} />;
};
