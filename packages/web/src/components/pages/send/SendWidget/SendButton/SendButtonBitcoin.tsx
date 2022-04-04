import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { styled } from '@linaria/react';

import { ModalType, useFreeFeeLimits, useModals, useSendState } from 'app/contexts';
import { Button, Icon } from 'components/ui';
import { useFetchFees } from 'utils/providers/LockAndMintProvider';

const SendIcon = styled(Icon)`
  width: 24px;
  height: 24px;
  margin-right: 12px;
`;

const getTransactionFee = (amount: string, fees: any) => {
  const renTxTypeFee = fees.burn;
  const amountNumber = Number(amount);
  const renVMFee = Number(renTxTypeFee) / 10000; // percent value
  const renVMFeeAmount = Number(amountNumber * renVMFee);
  const networkFee = Number(fees.release) / 10 ** 8;
  const total = Number(Number(amountNumber - renVMFeeAmount - networkFee).toFixed(6));

  return total > 0 ? total : 0;
};

interface Props {
  primary: boolean;
  disabled: boolean;
  onInitBurnAndRelease: () => void;
}

export const SendButtonBitcoin: FC<Props> = ({ primary, disabled, onInitBurnAndRelease }) => {
  const { openModal } = useModals();
  const sendState = useSendState();
  const { fees, pending: isFetchingFee } = useFetchFees(true);

  const [renBtcMinimalAmount, setRenBtcMinimalAmount] = useState(0);
  const { userFreeFeeLimits } = useFreeFeeLimits();

  useEffect(() => {
    if (sendState.blockchain === 'bitcoin' && !isFetchingFee) {
      const amount = getTransactionFee(sendState.fromAmount, fees);
      setRenBtcMinimalAmount(amount);
    }
  }, [fees, sendState.fromAmount, isFetchingFee, sendState.blockchain]);

  const handleSubmit = async () => {
    const params = {
      source: sendState.fromTokenAccount,
      destination: sendState.toPublicKey,
      amount: sendState.parsedAmount, // new TokenAmount
    };

    const result = await openModal<boolean>(ModalType.SHOW_MODAL_TRANSACTION_CONFIRM, {
      type: 'send',
      params,
      userFreeFeeLimits,
      sendState,
      address: sendState.toPublicKey,
    });

    if (!result) {
      return false;
    }

    onInitBurnAndRelease();
  };

  // const hasRenBtcMinimalAmount = isRenBTC ? renBtcMinimalAmount > 0 : true;
  const hasRenBtcMinimalAmount = true;

  return (
    <Button
      primary={primary}
      disabled={disabled || !hasRenBtcMinimalAmount}
      big
      full
      onClick={handleSubmit}
    >
      <SendIcon name="top" />
      Send now
    </Button>
  );
};
