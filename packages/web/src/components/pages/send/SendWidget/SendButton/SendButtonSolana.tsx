import type { FC } from 'react';
import React from 'react';

import { styled } from '@linaria/react';
import { useTokenAccount } from '@p2p-wallet-web/core';
import { usePubkey } from '@p2p-wallet-web/sail';
import { PublicKey } from '@solana/web3.js';

import { ModalType, useModals, useSendState, useTransferAction } from 'app/contexts';
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
    fromTokenAccount,
    resolvedAddress,
    toPublicKey,
    destinationAddress,
    setIsExecuting,
    parsedAmount,
  } = useSendState();
  const transferAction = useTransferAction();

  const destinationTokenAccount = useTokenAccount(usePubkey(destinationAddress));

  const handleSubmit = async () => {
    if (!fromTokenAccount?.key || !fromTokenAccount?.balance || !parsedAmount) {
      throw new Error("Didn't find token account");
    }

    if (parsedAmount.equalTo(0)) {
      throw new Error('Invalid amount');
    }

    const destination = new PublicKey(destinationAddress);

    if (parsedAmount.token.symbol !== 'SOL') {
      if (
        destinationTokenAccount &&
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
        source: fromTokenAccount.key,
        destination,
        amount: parsedAmount,
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

  return (
    <Button primary={primary} disabled={disabled} big full onClick={handleSubmit}>
      <SendIcon name="top" />
      Send now
    </Button>
  );
};
