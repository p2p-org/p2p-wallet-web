// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-nested-ternary */
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { AsyncThunkAction, unwrapResult } from '@reduxjs/toolkit';
import classNames from 'classnames';
import { Decimal } from 'decimal.js';

import { Token } from 'api/token/Token';
import { Transaction } from 'api/transaction/Transaction';
import { AmountUSD } from 'components/common/AmountUSD';
import { ToastManager } from 'components/common/ToastManager';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Button } from 'components/ui';
import { getTransaction } from 'store/slices/transaction/TransactionSlice';
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
  Desc,
  FieldsWrapper,
  FieldTitle,
  FieldValue,
  FieldWrapper,
  Footer,
  Header,
  OtherIcon,
  ProgressWrapper,
  SendWrapper,
  ShareIcon,
  ShareWrapper,
  SwapAmount,
  SwapBlock,
  SwapColumn,
  SwapIcon,
  SwapInfo,
  SwapWrapper,
  Title,
  ValueCurrency,
  ValueOriginal,
  Wrapper,
} from '../common/styled';

const INITIAL_PROGRESS = 5;

const ProgressLine = styled.div`
  width: ${INITIAL_PROGRESS}%;
  height: 1px;

  background: #5887ff;

  transition: width 0.15s;
`;

type Props = {
  type: 'send' | 'swap';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: AsyncThunkAction<string, any, any>;
  fromToken: Token;
  fromAmount: Decimal;
  toToken?: Token;
  toAmount?: Decimal;
  close: (signature: string | null) => void;
};

const handleCopyClick = (publicKey: string) => () => {
  try {
    void navigator.clipboard.writeText(publicKey);
    ToastManager.info('Copied to buffer!');
  } catch (error) {
    console.error(error);
  }
};

export const TransactionStatusModal: FunctionComponent<Props> = ({
  type,
  action,
  fromToken,
  fromAmount,
  toToken,
  toAmount,
  close,
}) => {
  const dispatch = useDispatch();
  const [progress, setProgress] = useState(5);
  const [isExecuting, setIsExecuting] = useState(false);
  const [transactionError, setTransactionError] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const transaction = useSelector(
    (state) =>
      (signature &&
        state.transaction.items[signature] &&
        Transaction.from(state.transaction.items[signature])) ||
      null,
  );
  const cluster = useSelector((state) => state.wallet.network.cluster);
  const tokenAccounts = useSelector((state) => state.wallet.tokenAccounts);

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
  }, [isExecuting]);

  const executeAction = async () => {
    try {
      setIsExecuting(true);

      const resultSignature = unwrapResult(await dispatch(action));
      setSignature(resultSignature);

      if (type === 'send') {
        transferNotification({
          header: 'Sent',
          text: `- ${fromToken.toMajorDenomination(fromAmount).toString()} ${fromToken.symbol}`,
          symbol: fromToken.symbol,
        });
      }
    } catch (error) {
      setTransactionError((error as Error).message);
      setIsExecuting(false);
      ToastManager.error((error as Error).message);
    }
  };

  useEffect(() => {
    void executeAction();
  }, []);

  useEffect(() => {
    const mount = async () => {
      if (!signature) {
        return;
      }

      try {
        const trx = unwrapResult(await dispatch(getTransaction(signature)));

        if (!trx) {
          setTimeout(mount, 3000);
          return;
        }

        if (transactionError) {
          setTransactionError('');
        }
      } catch (error) {
        setTransactionError((error as Error).message);
        setIsExecuting(false);
        ToastManager.error((error as Error).message);
      }

      setIsExecuting(false);
    };

    void mount();
  }, [signature]);

  const isReceiver = useMemo(() => {
    if (!transaction) {
      return null;
    }

    return tokenAccounts.find(
      (tokenAccount) => tokenAccount.address === transaction.short.destination?.toBase58(),
    );
  }, [transaction?.short.destination, tokenAccounts]);

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

  const isProcessing = !signature || !transaction;
  const isSuccess = signature && transaction;

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
        ? `You’ve successfully sent ${fromToken.symbol}`
        : 'You’ve successfully swapped tokens';
    }

    if (transactionError) {
      return type === 'send' ? 'Tokens have not been debited' : 'Tokens have not been swapped';
    }

    return 'Transaction processing';
  };

  return (
    <Wrapper>
      <Header>
        <Title>{renderTitle()}</Title>
        <Desc>{renderDescription()}</Desc>
        <CloseWrapper onClick={handleCloseClick}>
          <CloseIcon name="close" />
        </CloseWrapper>
        <BlockWrapper
          className={classNames({
            isProcessing,
            isSuccess,
            isError: Boolean(transactionError),
          })}>
          {isSuccess ? (
            <CheckmarkIcon name="checkmark" />
          ) : (
            <OtherIcon name={transactionError ? 'warning' : 'timer'} />
          )}
        </BlockWrapper>
      </Header>
      <ProgressWrapper>
        <ProgressLine style={{ width: `${progress}%` }} />
      </ProgressWrapper>
      <Content>
        {type === 'send' ? (
          <SendWrapper>
            <ValueCurrency>
              {isReceiver ? '+' : '-'}{' '}
              {transaction?.short.destinationAmount.toNumber() ||
                fromToken.toMajorDenomination(fromAmount).toString()}{' '}
              {transaction?.short.sourceTokenAccount?.mint.symbol || fromToken.symbol}
            </ValueCurrency>
            <ValueOriginal>
              <AmountUSD
                prefix={isReceiver ? '+' : '-'}
                symbol={transaction?.short.sourceTokenAccount?.mint.symbol || fromToken.symbol}
                value={
                  transaction?.short.destinationAmount || fromToken.toMajorDenomination(fromAmount)
                }
              />
            </ValueOriginal>
          </SendWrapper>
        ) : undefined}
        {/* // TODO: actual swap transaction details */}
        {type === 'swap' && toToken && toAmount ? (
          <SwapWrapper>
            <SwapColumn>
              <SwapInfo>
                <TokenAvatar size={44} symbol={fromToken.symbol} />
                <SwapAmount>
                  - {fromToken.toMajorDenomination(fromAmount).toString()} {fromToken.symbol}
                </SwapAmount>
              </SwapInfo>
            </SwapColumn>
            <SwapBlock>
              <SwapIcon name="swap" />
            </SwapBlock>
            <SwapColumn>
              <SwapInfo>
                <TokenAvatar size={44} symbol={toToken.symbol} />
                <SwapAmount>
                  + {toToken.toMajorDenomination(toAmount).toString()} {toToken.symbol}
                </SwapAmount>
              </SwapInfo>
            </SwapColumn>
          </SwapWrapper>
        ) : undefined}
        {signature ? (
          <FieldsWrapper>
            <FieldWrapper>
              <FieldTitle>Transaction ID</FieldTitle>
              <FieldValue>
                {signature}{' '}
                <a
                  href={getExplorerUrl('tx', signature, cluster)}
                  target="_blank"
                  rel="noopener noreferrer noindex"
                  className="button">
                  <ShareWrapper onClick={handleCopyClick(signature)}>
                    <ShareIcon name="copy" />
                  </ShareWrapper>
                </a>
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
                href={getExplorerUrl('tx', signature, cluster)}
                target="_blank"
                rel="noopener noreferrer noindex"
                onClick={() => {
                  if (type === 'send') {
                    trackEvent('send_explorer_click', { transactionConfirmed: !isExecuting });
                  } else if (type === 'swap') {
                    trackEvent('swap_explorer_click', { transactionConfirmed: !isExecuting });
                  }
                }}
                className="button">
                <ButtonExplorer lightGray>View in blockchain explorer</ButtonExplorer>
              </a>
            ) : undefined}
          </>
        )}
      </Footer>
    </Wrapper>
  );
};
