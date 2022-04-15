import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';

import { useTransaction, useWallet } from '@p2p-wallet-web/core';
import classNames from 'classnames';
import dayjs from 'dayjs';

import type { ModalPropsType } from 'app/contexts';
import { ToastManager } from 'components/common/ToastManager';
import type { TransactionDetailsProps } from 'components/common/TransactionDetails';
import { transferNotification } from 'utils/transactionNotifications';

import { Send } from '../../TransactionConfirmModal/Send/Send';
import {
  BlockWrapper,
  CheckmarkIcon,
  DateHeader,
  Header,
  OtherIcon,
  ProgressLine,
  ProgressStub,
  ProgressWrapper,
  Section,
  Time,
  TransactionBadge,
  TransactionLabel,
  TransactionStatus,
  Wrapper,
} from '../common/styled';
import type { TransferParams } from './Send';
import type { SwapParams } from './Swap';

export const INITIAL_PROGRESS = 5;
/* eslint-disable  @typescript-eslint/no-magic-numbers */
const DEFAULT_TRANSACTION_ERROR = 'Transaction error';

type SendActionType = () => Promise<string>;
type SwapActionType = () => Promise<string>;

export type TransactionStatusModalProps = TransactionDetailsProps & {
  type: 'send' | 'swap';
  action: SendActionType | SwapActionType;
  params: TransferParams | SwapParams;
};

// @FIXME clean up props as in ConfirmModal
export const TransactionStatusModal: FunctionComponent<
  ModalPropsType<string | null> & TransactionStatusModalProps
> = ({ type, action, params, sendState, userFreeFeeLimits }) => {
  const { provider } = useWallet();

  const [progress, setProgress] = useState(5);
  const [isExecuting, setIsExecuting] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const transaction = useTransaction(signature as string);
  const [transactionError, setTransactionError] = useState(
    transaction?.raw?.meta?.err ? DEFAULT_TRANSACTION_ERROR : '',
  );

  useEffect(() => {
    let newProgress = INITIAL_PROGRESS;

    if (!isExecuting) {
      return;
    }

    const timerId = setInterval(() => {
      if (progress <= 95) {
        newProgress += 7;
        setProgress(newProgress);
      } else {
        newProgress = 95;
        setProgress(newProgress);
      }
    }, 2500);

    return () => {
      clearTimeout(timerId);
      setProgress(100);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExecuting]);

  const executeAction = async () => {
    try {
      setIsExecuting(true);

      switch (type) {
        case 'send': {
          const resultSignature = await (action as SendActionType)();
          setSignature(resultSignature);

          transferNotification({
            header: 'Sent',
            text: `- ${(params as TransferParams).amount.formatUnits()}`,
            symbol: (params as TransferParams).amount.token.symbol,
          });

          break;
        }
        case 'swap': {
          const resultSignature = await (action as SwapActionType)();
          setSignature(resultSignature);

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
          setTimeout(mount, 3000);
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

  const today = new Date();
  const utcDiff = today.getHours() - today.getUTCHours();

  const shortAddress = sendState.destinationAddress.replace(
    sendState.destinationAddress.substring(4, sendState.destinationAddress.length - 4),
    '...',
  );

  const renderStatus = (executing: boolean, success: boolean, error: boolean) => {
    switch (true) {
      case executing:
        return 'Pending';
      case success:
        return 'Completed';
      case error:
        return 'Error';
      default:
        return 'Pending';
    }
  };

  return (
    <Wrapper>
      <Section>
        <>
          <Header>
            {(params as TransferParams).amount.token.symbol} → {shortAddress}
          </Header>
          <DateHeader>
            <span>{dayjs().format('MMMM D, YYYY')}</span>
            <Time>{dayjs().format('hh:mm:ss')}</Time>
            <span>
              (UTC{utcDiff >= 0 ? '+' : '-'}
              {utcDiff})
            </span>
          </DateHeader>
        </>
      </Section>
      <ProgressWrapper>
        <ProgressLine
          style={{ width: `${progress}%` }}
          className={classNames({
            // isSuccess,
            // isError,
          })}
        />
        <ProgressStub />

        <BlockWrapper
          className={classNames({
            isProcessing,
            isSuccess,
            isError,
          })}
        >
          {isSuccess ? (
            <CheckmarkIcon name="success-send" />
          ) : (
            <OtherIcon name={transactionError ? 'error-send' : 'clock-send'} />
          )}
        </BlockWrapper>
      </ProgressWrapper>
      <Section>
        <TransactionStatus>
          Transaction status:
          <TransactionBadge>
            <TransactionLabel
              className={classNames({
                isProcessing,
                isSuccess,
                isError,
              })}
            />
            {renderStatus(isExecuting, isSuccess, isError)}
          </TransactionBadge>
        </TransactionStatus>
        <Send sendState={sendState} userFreeFeeLimits={userFreeFeeLimits} params={params} />
      </Section>
    </Wrapper>
  );
};
