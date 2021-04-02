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
import { getExplorerUrl } from 'utils/connection';

import {
  BlockWrapper,
  ButtonExplorer,
  CheckmarkIcon,
  CloseIcon,
  CloseWrapper,
  Content,
  CopyIcon,
  CopyWrapper,
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
  const [isError, setIsError] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const transaction = useSelector(
    (state) =>
      (signature &&
        state.transaction.items[signature] &&
        Transaction.from(state.transaction.items[signature])) ||
      null,
  );
  const cluster = useSelector((state) => state.wallet.cluster);
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
    } catch (error) {
      setIsError(true);
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
      } catch (error) {
        setIsError(true);
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

  const handleRetryClick = () => {
    void executeAction();
  };

  const handleCloseClick = () => {
    close(signature);
  };

  const isProcessing = !signature || !transaction;
  const isSuccess = signature && transaction;

  const renderTitle = () => {
    if (isSuccess) {
      return 'Success';
    }

    if (isError) {
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

    if (isError) {
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
            isError,
          })}>
          {isSuccess ? (
            <CheckmarkIcon name="checkmark" />
          ) : (
            <OtherIcon name={isError ? 'warning' : 'timer'} />
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
                <CopyWrapper onClick={handleCopyClick(signature)}>
                  <CopyIcon name="copy" />
                </CopyWrapper>
              </FieldValue>
            </FieldWrapper>
          </FieldsWrapper>
        ) : undefined}
      </Content>
      <Footer>
        {isError ? (
          <>
            <Button primary disabled={isExecuting} onClick={handleRetryClick}>
              Try again
            </Button>
            <Button lightGray disabled={isExecuting} onClick={handleCloseClick}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button primary onClick={handleCloseClick}>
              Done
            </Button>
            {signature ? (
              <a
                href={getExplorerUrl('tx', signature, cluster)}
                target="_blank"
                rel="noopener noreferrer noindex"
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
