import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { styled } from '@linaria/react';

import { ModalType, useFreeFeeLimits, useModals, useSendState } from 'app/contexts';
import { Button, Icon } from 'components/ui';
import { useFetchFees } from 'utils/providers/LockAndMintProvider';

const PERCENT_VALUE_DELIMITER = 10000;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const NETWORK_FEE_DELIMITER = 10 ** 8;
const FRACTION_DIGITS = 6;

const SendIcon = styled(Icon)`
  width: 24px;
  height: 24px;
  margin-right: 12px;
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getTransactionFee = (amount: string, fees: any) => {
  const renTxTypeFee = fees.burn;
  const amountNumber = Number(amount);
  const renVMFee = Number(renTxTypeFee) / PERCENT_VALUE_DELIMITER; // percent value
  const renVMFeeAmount = Number(amountNumber * renVMFee);
  const networkFee = Number(fees.release) / NETWORK_FEE_DELIMITER;
  const total = Number(Number(amountNumber - renVMFeeAmount - networkFee).toFixed(FRACTION_DIGITS));

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
      btcAddress: sendState.toPublicKey,
    });

    if (!result) {
      return false;
    }

    onInitBurnAndRelease();
  };

  const hasRenBtcMinimalAmount = (sendState.isRenBTC ? renBtcMinimalAmount > 0 : true) || true;

  const text = useMemo(() => {
    if (sendState.isAddressNotMatchNetwork) {
      return 'Change the network or the address';
    }

    return (
      <>
        <SendIcon name="top" />
        Send now
      </>
    );
  }, [sendState.isAddressNotMatchNetwork]);

  return (
    <Button
      primary={primary}
      disabled={disabled || !hasRenBtcMinimalAmount}
      big
      full
      onClick={handleSubmit}
    >
      {text}
    </Button>
  );
};
