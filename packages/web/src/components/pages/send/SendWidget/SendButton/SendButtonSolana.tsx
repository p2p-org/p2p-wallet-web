import type { FC } from 'react';
import { useMemo } from 'react';

import { styled } from '@linaria/react';
import { useTokenAccount } from '@p2p-wallet-web/core';
import { usePubkey } from '@p2p-wallet-web/sail';
import { PublicKey } from '@solana/web3.js';

import {
  ModalType,
  useFeeCompensation,
  useModals,
  useSendState,
  useTransferAction,
} from 'app/contexts';
import type { TransactionConfirmModalProps } from 'components/modals/TransactionConfirmModal/TransactionConfirmModal';
import type { TransactionStatusModalProps } from 'components/modals/TransactionInfoModals/TransactionStatusModal/TransactionStatusModal';
import { Button, Icon } from 'components/ui';
import { trackEvent } from 'utils/analytics';

const SendIcon = styled(Icon)`
  width: 24px;
  height: 24px;
  margin-right: 12px;
`;

interface Props {
  primary: boolean;
  disabled: boolean;
}

export const SendButtonSolana: FC<Props> = ({ primary, disabled }) => {
  const { openModal } = useModals();
  const {
    fromAmount,
    fromTokenAccount,
    resolvedAddress,
    toPublicKey,
    destinationAddress,
    setIsExecuting,
    parsedAmount,
    destinationAccount,
    hasBalance,
    details,
  } = useSendState();
  const transferAction = useTransferAction();
  const { compensationParams } = useFeeCompensation();

  const destinationTokenAccount = useTokenAccount(usePubkey(destinationAddress));

  const handleSubmit = async () => {
    if (!fromTokenAccount?.key || !fromTokenAccount?.balance || !parsedAmount) {
      throw new Error("Didn't find token account");
    }

    if (parsedAmount.equalTo(0)) {
      throw new Error('Invalid amount');
    }

    if (!destinationAccount) {
      throw new Error('Invalid destination');
    }

    const destination = new PublicKey(destinationAddress);

    if (parsedAmount.token.symbol !== 'SOL') {
      if (
        destinationTokenAccount &&
        destinationTokenAccount.balance && // FIXME
        destinationTokenAccount.balance?.token.symbol !== 'SOL' &&
        !destinationTokenAccount.balance?.token.mintAccount.equals(parsedAmount.token.mintAccount)
      ) {
        void openModal(ModalType.SHOW_MODAL_ERROR, {
          icon: 'wallet',
          header: 'Wallet address is not valid',
          text: `The wallet address is not valid. It must be a ${parsedAmount.token.symbol} wallet address`,
        });
        return;
      }
    }

    const result = await openModal<boolean, TransactionConfirmModalProps>(
      ModalType.SHOW_MODAL_TRANSACTION_CONFIRM,
      {
        type: 'send',
        params: {
          source: fromTokenAccount,
          destination,
          amount: parsedAmount,
          username: resolvedAddress ? toPublicKey : '',
        },
      },
    );

    if (!result) {
      return false;
    }

    try {
      setIsExecuting(true);

      const action = transferAction({
        fromTokenAccount,
        destinationAccount,
        amount: parsedAmount,
        compensationParams,
      });

      trackEvent('send_send_click', {
        tokenTicker: fromTokenAccount.balance.token.symbol || '',
        sum: parsedAmount.asNumber,
      });

      await openModal<any, TransactionStatusModalProps>(ModalType.SHOW_MODAL_TRANSACTION_STATUS, {
        type: 'send',
        action,
        params: {
          source: fromTokenAccount,
          amount: parsedAmount,
        },
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const text = useMemo(() => {
    if (!Number(fromAmount)) {
      return 'Enter the amount';
    }

    if (!hasBalance) {
      return <>There is not enough {fromTokenAccount?.balance?.token.symbol} balance</>;
    }

    if (!destinationAddress) {
      return 'Choose the recipient';
    }

    return (
      <>
        <SendIcon name="top" />
        Send {details.totalAmountToShow}
      </>
    );
  }, [
    destinationAddress,
    fromAmount,
    fromTokenAccount?.balance,
    hasBalance,
    details.totalAmountToShow,
  ]);

  return (
    <Button primary={primary} disabled={disabled} big full onClick={handleSubmit}>
      {text}
    </Button>
  );
};
