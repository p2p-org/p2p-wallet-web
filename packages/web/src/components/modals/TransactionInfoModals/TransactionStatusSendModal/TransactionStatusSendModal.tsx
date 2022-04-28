import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';

import { useTransaction, useWallet } from '@p2p-wallet-web/core';
import { useConnectionContext } from '@saberhq/use-solana';

import type { ModalPropsType } from 'app/contexts';
import { ToastManager } from 'components/common/ToastManager';
import type { TransactionDetailsProps } from 'components/common/TransactionDetails';
import { trackEvent } from 'utils/analytics';
import { transferNotification } from 'utils/transactionNotifications';

import { Send } from '../../TransactionConfirmModal/Send/Send';
import { DateHeader, SolanaExplorerLink, TransactionProgress } from '../common';
import { CloseIcon, CloseWrapper, Header, Section, WrapperModal } from '../common/styled';
import type { TransferParams } from './Send';

export type TransactionStatusModalProps = TransactionDetailsProps & {
  action: () => Promise<string>;
  params: TransferParams;
};

export const INITIAL_PROGRESS = 5;
const ADDRESS_CHARS_SHOW = 4;
const DEFAULT_TRANSACTION_ERROR = 'Transaction error';
const CHECK_TRANSACTION_INTERVAL = 3000;

export const TransactionStatusSendModal: FunctionComponent<
  ModalPropsType<string | null> & TransactionStatusModalProps
> = ({ type, action, params, sendState, userFreeFeeLimits, networkFees, close }) => {
  const { provider } = useWallet();

  const { network } = useConnectionContext();
  const [isExecuting, setIsExecuting] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const transaction = useTransaction(signature as string);
  const [transactionError, setTransactionError] = useState(
    transaction?.raw?.meta?.err ? DEFAULT_TRANSACTION_ERROR : '',
  );

  const executeAction = async () => {
    try {
      setIsExecuting(true);

      switch (type) {
        case 'send': {
          const resultSignature = await action();
          setSignature(resultSignature);

          transferNotification({
            header: 'Sent',
            text: `- ${params.amount.formatUnits()}`,
            symbol: params.amount.token.symbol,
          });

          break;
        }
        default:
          throw new Error('Wrong type');
      }
    } catch (error) {
      // setTransactionError((error as Error).message);
      setIsExecuting(false);

      if (type === 'send') {
        ToastManager.error(type, (error as Error).message);
        setTransactionError(DEFAULT_TRANSACTION_ERROR);
      }
    }
  };

  useEffect(() => {
    void executeAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mount = async () => {
      if (!signature) {
        return;
      }

      try {
        const trx = await provider.connection.getTransaction(signature, {
          commitment: 'confirmed',
        });
        if (trx) {
          if (trx.meta?.err) {
            setTransactionError(DEFAULT_TRANSACTION_ERROR);
          } else if (transactionError) {
            setTransactionError('');
          }
        } else {
          setTimeout(mount, CHECK_TRANSACTION_INTERVAL);
        }
      } catch (error) {
        // setTransactionError((error as Error).message);
        ToastManager.error((error as Error).message);
      } finally {
        setIsExecuting(false);
      }
    };

    void mount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const isProcessing = (!signature || !transaction?.key) && !transactionError;
  const isSuccess = Boolean(signature && transaction?.key && !transactionError);
  const isError = Boolean(transactionError);

  const shortAddress = sendState?.destinationAddress.replace(
    sendState?.destinationAddress.substring(
      ADDRESS_CHARS_SHOW,
      sendState?.destinationAddress.length - ADDRESS_CHARS_SHOW,
    ),
    '...',
  );

  const handleCloseClick = () => {
    trackEvent('send_close_click', { transactionConfirmed: !isExecuting });

    close(signature);
  };

  return (
    <WrapperModal close={handleCloseClick}>
      <Section>
        <Header>
          {params.amount.token.symbol} → {shortAddress}
          <CloseWrapper onClick={handleCloseClick}>
            <CloseIcon name="close" />
          </CloseWrapper>
          <DateHeader />
        </Header>
      </Section>
      <TransactionProgress
        isError={isError}
        isProcessing={isProcessing}
        isSuccess={isSuccess}
        isExecuting={isExecuting}
        label={'Transaction status:'}
      />
      <Section>
        <Send
          sendState={sendState}
          userFreeFeeLimits={userFreeFeeLimits}
          params={params}
          networkFees={networkFees}
        />
      </Section>
      <SolanaExplorerLink
        signature={signature}
        network={network}
        amplitudeAction={{
          name: 'send_explorer_click',
          data: { transactionConfirmed: !isExecuting },
        }}
      />
    </WrapperModal>
  );
};
