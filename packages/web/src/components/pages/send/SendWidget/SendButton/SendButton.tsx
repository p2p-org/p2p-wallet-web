import type { FC } from 'react';

import { useSendState } from 'app/contexts';

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
    isShowConfirmAddressSwitch,
    setIsInitBurnAndRelease,
  } = useSendState();

  const hasBalance = fromTokenAccount?.balance
    ? fromTokenAccount.balance?.asNumber >= Number(fromAmount)
    : false;

  const isDisabledButton =
    isExecuting ||
    !destinationAddress ||
    isValidAmount(fromAmount) ||
    isAddressInvalid ||
    !hasBalance ||
    isShowConfirmAddressSwitch;

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
