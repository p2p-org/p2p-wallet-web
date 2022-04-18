import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';

import { useTransaction, useWallet } from '@p2p-wallet-web/core';
import { useConnectionContext } from '@saberhq/use-solana';
import classNames from 'classnames';
import dayjs from 'dayjs';

import type { ModalPropsType } from 'app/contexts';
import { ToastManager } from 'components/common/ToastManager';
import type { TransactionDetailsProps } from 'components/common/TransactionDetails';
import { trackEvent } from 'utils/analytics';
import { getExplorerUrl } from 'utils/connection';
import { transferNotification } from 'utils/transactionNotifications';

import { Send } from '../../TransactionConfirmModal/Send/Send';
import {
  BlockWrapper,
  CheckmarkIcon,
  CloseIcon,
  CloseWrapper,
  DateHeader,
  Footer,
  GoToExplorerIcon,
  GoToExplorerLink,
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

type SendActionType = () => Promise<string>;
type SwapActionType = () => Promise<string>;

export type TransactionStatusModalProps = TransactionDetailsProps & {
  type: 'send' | 'swap';
  action: SendActionType | SwapActionType;
  params: TransferParams | SwapParams;
};

export const INITIAL_PROGRESS = 5;
const UPPER_PROGRESS_BOUND = 95;
const LOWER_PROGRESS_BOUND = 7;
const CHECK_PROGRESS_INTERVAL = 2500;
const FULL_PROGRESS = 100;
const ADDRESS_CHARS_SHOW = 4;
const DEFAULT_TRANSACTION_ERROR = 'Transaction error';

export const TransactionStatusModal: FunctionComponent<
  ModalPropsType<string | null> & TransactionStatusModalProps
> = ({ type, action, params, sendState, userFreeFeeLimits, networkFees, close }) => {
  const { provider } = useWallet();

  const { network } = useConnectionContext();
  const [progress, setProgress] = useState(INITIAL_PROGRESS);
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
      if (progress <= UPPER_PROGRESS_BOUND) {
        newProgress += LOWER_PROGRESS_BOUND;
        setProgress(newProgress);
      } else {
        newProgress = UPPER_PROGRESS_BOUND;
        setProgress(newProgress);
      }
    }, CHECK_PROGRESS_INTERVAL);

    return () => {
      clearTimeout(timerId);
      setProgress(FULL_PROGRESS);
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
          setTimeout(mount, CHECK_PROGRESS_INTERVAL);
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
    sendState.destinationAddress.substring(
      ADDRESS_CHARS_SHOW,
      sendState.destinationAddress.length - ADDRESS_CHARS_SHOW,
    ),
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

  const handleCloseClick = () => {
    if (type === 'send') {
      trackEvent('send_close_click', { transactionConfirmed: !isExecuting });
    } else if (type === 'swap') {
      trackEvent('swap_close_click', { transactionConfirmed: !isExecuting });
    }

    close(signature);
  };

  return (
    <Wrapper>
      <Section>
        <>
          <Header>
            {(params as TransferParams).amount.token.symbol} → {shortAddress}
            <CloseWrapper onClick={handleCloseClick}>
              <CloseIcon name="close" />
            </CloseWrapper>
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
            isSuccess,
            isError,
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
        <Send
          sendState={sendState}
          userFreeFeeLimits={userFreeFeeLimits}
          params={params as TransferParams}
          networkFees={networkFees}
        />
      </Section>
      {signature ? (
        <Footer>
          <GoToExplorerLink
            href={getExplorerUrl('tx', signature, network)}
            target="_blank"
            rel="noopener noreferrer noindex"
            onClick={() => {
              if (type === 'send') {
                trackEvent('send_explorer_click', { transactionConfirmed: !isExecuting });
              } else if (type === 'swap') {
                trackEvent('swap_explorer_click', { transactionConfirmed: !isExecuting });
              }
            }}
            className="button"
          >
            <GoToExplorerIcon name={'external'} />
            View in Solana explorer
          </GoToExplorerLink>
        </Footer>
      ) : undefined}
    </Wrapper>
  );
};
