import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { styled } from '@linaria/react';

import { ModalType, useModals, useSendState } from 'app/contexts';
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
  const { fromTokenAccount, toPublicKey, fromAmount, blockchain, isRenBTC } = useSendState();
  const { fees, pending: isFetchingFee } = useFetchFees(true);

  const [renBtcMinimalAmount, setRenBtcMinimalAmount] = useState(0);

  useEffect(() => {
    if (blockchain === 'bitcoin' && !isFetchingFee) {
      const amount = getTransactionFee(fromAmount, fees);
      setRenBtcMinimalAmount(amount);
    }
  }, [fees, fromAmount, isFetchingFee, blockchain]);

  const handleSubmit = async () => {
    const result = await openModal<boolean>(ModalType.SHOW_MODAL_TRANSACTION_CONFIRM, {
      type: 'send',
      params: {
        source: fromTokenAccount,
        destination: toPublicKey,
        amount: fromAmount,
      },
    });

    if (!result) {
      return false;
    }

    onInitBurnAndRelease();
  };

  const hasRenBtcMinimalAmount = isRenBTC ? renBtcMinimalAmount > 0 : true;

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
