import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';

import { useConnectionContext, useTransaction, useWallet } from '@p2p-wallet-web/core';
import classNames from 'classnames';
import dayjs from 'dayjs';

import type { ModalPropsType } from 'app/contexts';
import { ToastManager } from 'components/common/ToastManager';
import { Button } from 'components/ui';
import { trackEvent } from 'utils/analytics';
import { getExplorerUrl } from 'utils/connection';
import { transferNotification } from 'utils/transactionNotifications';

import {
  BlockWrapper,
  ButtonExplorer,
  CheckmarkIcon,
  CloseIcon,
  CloseWrapper,
  Content,
  DateHeader,
  Desc,
  FieldsWrapper,
  FieldTitle,
  FieldValue,
  FieldWrapper,
  Footer,
  Header,
  OtherIcon,
  ProgressLine,
  ProgressWrapper,
  Section,
  ShareIcon,
  ShareWrapper,
  Time,
  Title,
  TransactionBadge,
  TransactionLabel,
  TransactionStatus,
  Wrapper,
} from '../common/styled';
import type { TransferParams } from './Send';
import { Send } from './Send';
import type { SwapParams } from './Swap';
import { Swap } from './Swap';

const handleCopyClick = (str: string) => () => {
  try {
    void navigator.clipboard.writeText(str);
    ToastManager.info('Copied to buffer!');
  } catch (error) {
    console.error(error);
  }
};

export const INITIAL_PROGRESS = 5;
/* eslint-disable  @typescript-eslint/no-magic-numbers */
const DEFAULT_TRANSACTION_ERROR = 'Transaction error';

type SendActionType = () => Promise<string>;
type SwapActionType = () => Promise<string>;

export type TransactionStatusModalProps = {
  type: 'send' | 'swap';
  action: SendActionType | SwapActionType;
  params: TransferParams | SwapParams;
};

export const TransactionStatusModal: FunctionComponent<
  ModalPropsType<string | null> & TransactionStatusModalProps
> = ({ type, action, params, close }) => {
  const { provider } = useWallet();

  const [progress, setProgress] = useState(5);
  const [isExecuting, setIsExecuting] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const transaction = useTransaction(signature);
  const [transactionError, setTransactionError] = useState(
    transaction?.raw?.meta?.err ? DEFAULT_TRANSACTION_ERROR : '',
  );
  const { network } = useConnectionContext();

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

  const handleCloseClick = () => {
    if (type === 'send') {
      trackEvent('send_close_click', { transactionConfirmed: !isExecuting });
    } else if (type === 'swap') {
      trackEvent('swap_close_click', { transactionConfirmed: !isExecuting });
    }

    close(signature);
  };

  const handleDoneClick = () => {
    if (type === 'send') {
      trackEvent('send_done_click', { transactionConfirmed: !isExecuting });
    } else if (type === 'swap') {
      trackEvent('swap_done_click', { transactionConfirmed: !isExecuting });
    }

    close(signature);
  };

  const handleRetryClick = () => {
    if (type === 'send') {
      trackEvent('send_try_again_click', { error: transactionError });
    } else if (type === 'swap') {
      trackEvent('swap_try_again_click', { error: transactionError });
    }

    void executeAction();
  };

  const handleCancelClick = () => {
    if (type === 'send') {
      trackEvent('send_cancel_click', { error: transactionError });
    } else if (type === 'swap') {
      trackEvent('swap_cancel_click', { error: transactionError });
    }

    close(signature);
  };

  const isProcessing = (!signature || !transaction?.key) && !transactionError;
  const isSuccess = Boolean(signature && transaction?.key && !transactionError);
  const isError = Boolean(transactionError);

  const renderTitle = () => {
    if (isSuccess) {
      return 'Success';
    }

    if (transactionError) {
      return 'Something went wrong';
    }

    return type === 'send' ? 'Sending...' : 'Swapping...';
  };

  const renderDescription = () => {
    if (isSuccess) {
      return type === 'send'
        ? `You’ve successfully sent ${(params as TransferParams).amount.token.symbol}`
        : 'You’ve successfully swapped tokens';
    }

    if (transactionError) {
      return type === 'send' ? 'Tokens have not been debited' : 'Tokens have not been swapped';
    }

    return 'Transaction processing';
  };

  // @FIXME MOCKS
  const DATE = new Date();
  const utcDiff = DATE.getHours() - DATE.getUTCHours();

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
        {/*<Header>{(params as TransferParams).amount.token.symbol}`</Header>*/}
        <Header>SOL → 5faZ...zbXz</Header>
        <DateHeader>
          <span>{dayjs().format('MMMM D, YYYY')}</span>
          <Time>{dayjs().format('hh:mm:ss')}</Time>
          <span>
            (UTC{utcDiff >= 0 ? '+' : '-'}
            {utcDiff})
          </span>
        </DateHeader>
      </Section>
      <ProgressWrapper>
        <ProgressLine style={{ width: `${progress}%` }} />
        <BlockWrapper
          className={classNames({
            isProcessing,
            isSuccess,
            isError,
          })}
        >
          {isSuccess ? (
            <CheckmarkIcon name="checkmark" />
          ) : (
            <OtherIcon name={transactionError ? 'warning' : 'timer'} />
          )}
        </BlockWrapper>
      </ProgressWrapper>
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
    </Wrapper>
  );

  return (
    <Wrapper>
      <Header>
        <Title>{renderTitle()}</Title>
        <Desc>{renderDescription()}</Desc>
        <CloseWrapper onClick={handleCloseClick}>
          <CloseIcon name="close" />
        </CloseWrapper>
      </Header>
      <Content>
        {type === 'send' ? (
          <Send params={params as TransferParams} transaction={transaction} />
        ) : undefined}
        {type === 'swap' ? <Swap params={params as SwapParams} /> : undefined}
        {signature ? (
          <FieldsWrapper>
            <FieldWrapper>
              <FieldTitle>Transaction ID</FieldTitle>
              <FieldValue>
                {signature}{' '}
                <ShareWrapper onClick={handleCopyClick(getExplorerUrl('tx', signature, network))}>
                  <ShareIcon name="copy" />
                </ShareWrapper>
              </FieldValue>
            </FieldWrapper>
          </FieldsWrapper>
        ) : undefined}
      </Content>
      <Footer>
        {transactionError ? (
          <>
            <Button primary disabled={isExecuting} onClick={handleRetryClick}>
              Try again
            </Button>
            <Button lightGray disabled={isExecuting} onClick={handleCancelClick}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button primary onClick={handleDoneClick}>
              Done
            </Button>
            {signature ? (
              <a
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
                <ButtonExplorer lightGray>View in blockchain explorer</ButtonExplorer>
              </a>
            ) : undefined}
          </>
        )}
      </Footer>
    </Wrapper>
  );
};
