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
  } = useSendState();
  const { estimatedFeeAmount } = useFeeCompensation();

  const feeToken = estimatedFeeAmount.accountsCreation.feeToken;
  const feeAmount = feeToken?.asNumber;
  const isSPLPayed = feeToken?.token?.info?.symbol === fromTokenAccount?.balance?.token?.symbol;
  const tokenBalance = fromTokenAccount?.balance?.asNumber;
  const maxAllowedAmount = isSPLPayed ? tokenBalance - Number(feeAmount) : tokenBalance;

  const hasBalance = fromTokenAccount?.balance ? maxAllowedAmount >= Number(fromAmount) : false;

  const isDisabledButton =
    isExecuting ||
    !destinationAddress ||
    isValidAmount(fromAmount) ||
    isAddressInvalid ||
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
