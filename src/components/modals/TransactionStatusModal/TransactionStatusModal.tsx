// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable unicorn/no-nested-ternary */
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { AsyncThunkAction, unwrapResult } from '@reduxjs/toolkit';
import classNames from 'classnames';
import { Decimal } from 'decimal.js';
import { rgba } from 'polished';

import { Token } from 'api/token/Token';
import { Transaction } from 'api/transaction/Transaction';
import { AmountUSD } from 'components/common/AmountUSD';
import { ToastManager } from 'components/common/ToastManager';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Button, Icon } from 'components/ui';
import { getTransaction } from 'store/slices/transaction/TransactionSlice';
import { getExplorerUrl } from 'utils/connection';

const INITIAL_PROGRESS = 5;

const Wrapper = styled.div`
  position: relative;

  display: flex;
  flex-basis: 524px;
  flex-direction: column;
  overflow: hidden;

  background: #fff;

  border-radius: 15px;
`;

const Header = styled.div`
  position: relative;

  padding: 26px 20px 50px;

  text-align: center;
`;

const Title = styled.div`
  margin-bottom: 10px;

  color: #000;
  font-weight: bold;
  font-size: 20px;
  line-height: 100%;
`;

const Desc = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;
  line-height: 100%;
`;

const CloseWrapper = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  background: #f6f6f8;
  border-radius: 8px;

  cursor: pointer;
`;

const CloseIcon = styled(Icon)`
  width: 16px;
  height: 16px;

  color: #a3a5ba;
`;

const BlockWrapper = styled.div`
  position: absolute;
  bottom: -28px;
  left: 50%;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 55px;
  height: 55px;
  margin-left: -27px;

  background: #5887ff;
  border-radius: 12px;

  &.isProcessing {
    background: #ffd177;
  }

  &.isSuccess {
    background: #77db7c;
  }

  &.isError {
    background: #f77;
  }
`;

const CheckmarkIcon = styled(Icon)`
  width: 45px;
  height: 45px;

  color: #fff;
`;

const OtherIcon = styled(Icon)`
  width: 37px;
  height: 37px;

  color: #fff;
`;

const ProgressWrapper = styled.div`
  height: 1px;

  background: rgba(0, 0, 0, 0.05);
`;

const ProgressLine = styled.div`
  width: ${INITIAL_PROGRESS}%;
  height: 1px;

  background: #5887ff;

  transition: width 0.15s;
`;

const Content = styled.div``;

const SendWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 40px 0 20px;
`;

const ValueCurrency = styled.div`
  color: #000;
  font-weight: 600;
  font-size: 28px;
  line-height: 120%;
`;

const ValueOriginal = styled.div`
  margin-top: 4px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;
  line-height: 120%;
`;

const SwapWrapper = styled.div`
  display: flex;
  justify-content: center;

  margin: 70px 0 40px;
`;

const SwapColumn = styled.div`
  display: flex;
  flex: 1;
  align-items: center;

  &:not(:first-child) {
    justify-content: flex-start;
  }

  &:not(:last-child) {
    justify-content: flex-end;
  }
`;

const SwapInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SwapBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;
  margin: 6px 26px 0;

  background: #f6f6f8;
  border-radius: 12px;
`;

const SwapIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

const SwapAmount = styled.div`
  margin-top: 10px;

  color: #000;
  font-weight: 600;
  font-size: 18px;
  line-height: 120%;
`;

const FieldsWrapper = styled.div``;

const FieldWrapper = styled.div`
  padding: 16px 30px;

  &:first-child {
    border-top: 1px solid ${rgba('#000', 0.05)};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${rgba('#000', 0.05)};
  }
`;

const FieldTitle = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
`;

const FieldValue = styled.div`
  display: flex;
  align-items: center;
  margin-top: 3px;

  font-weight: 600;
  font-size: 14px;
  line-height: 21px;
`;

const CopyIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

const CopyWrapper = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-left: 20px;

  background: rgba(163, 165, 186, 0.1);
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: #eff3ff;

    ${CopyIcon} {
      color: #5887ff;
    }
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  padding: 24px 20px;

  border-top: 1px solid ${rgba('#000', 0.05)};

  & > :not(:last-child) {
    margin-right: 16px;
  }
`;

const ButtonExplorer = styled(Button)`
  font-weight: 600;
  font-size: 14px;
  line-height: 150%;
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
