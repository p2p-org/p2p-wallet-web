import React, { FC, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import { PublicKey, TransactionSignature } from '@solana/web3.js';
import classNames from 'classnames';
import dayjs from 'dayjs';

import { Transaction } from 'api/transaction/Transaction';
import { AmountUSD } from 'components/common/AmountUSD';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { getTransaction } from 'store/slices/transaction/TransactionSlice';
import { getExplorerUrl } from 'utils/connection';
import { shortAddress } from 'utils/tokens';

import {
  BlockWrapper,
  ButtonExplorer,
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

const StatusWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
`;

const Status = styled.div`
  display: flex;
  align-items: center;
  height: 32px;
  padding: 2px 10px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 13px;
  line-height: 20px;

  background: rgba(246, 246, 248, 0.5);
  border-radius: 6px;
`;

const StatusIndicator = styled.div`
  width: 8px;
  height: 8px;
  margin-right: 6px;

  background: #77db7c;
  border-radius: 2px;
`;

const FieldRowWrapper = styled(FieldWrapper)`
  display: grid;
  grid-auto-flow: column;
  grid-gap: 36px;
`;

const ColumnWrapper = styled.div``;

const FieldInfo = styled.div`
  display: flex;
  margin-top: 15px;
`;

const AddressWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin: 0 9px 0 12px;
`;

const AddressTitle = styled.div`
  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const AddressValue = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
`;

type Props = {
  signature: TransactionSignature;
  source: PublicKey;
  close: () => void;
};

export const TransactionDetailsModal: FC<Props> = ({ signature, source, close }) => {
  const dispatch = useDispatch();
  const [isShowDetails, setShowDetails] = useState(false);
  const cluster = useSelector((state) => state.wallet.network.cluster);
  const transaction = useSelector(
    (state) =>
      state.transaction.items[signature] && Transaction.from(state.transaction.items[signature]),
  );
  const tokenAccounts = useSelector((state) => state.wallet.tokenAccounts);

  useEffect(() => {
    const mount = async () => {
      const trx = unwrapResult(await dispatch(getTransaction(signature)));

      if (!trx) {
        setTimeout(mount, 3000);
      }
    };

    if (!transaction) {
      void mount();
    }
  }, [signature]);

  const details = useMemo(() => {
    if (!transaction) {
      return null;
    }

    return transaction.details(transaction.short.destination?.equals(source));
  }, [transaction?.short.destination, tokenAccounts]);

  if (!details || !transaction) {
    return null;
  }

  const handleToggleShowDetailsClick = () => {
    setShowDetails((state) => !state);
  };

  const renderFromTo = () => {
    if (details.type === 'swap') {
      return (
        <>
          {details.sourceTokenAccount ? (
            <FieldWrapper>
              <FieldTitle>From</FieldTitle>
              <FieldValue>{details.sourceTokenAccount.address.toBase58()}</FieldValue>
            </FieldWrapper>
          ) : undefined}
          {details.destinationTokenAccount ? (
            <FieldWrapper>
              <FieldTitle>To</FieldTitle>
              <FieldValue>{details.destinationTokenAccount.address.toBase58()}</FieldValue>
            </FieldWrapper>
          ) : undefined}
        </>
      );
    }

    return (
      <FieldRowWrapper>
        {details.sourceTokenAccount ? (
          <ColumnWrapper>
            <FieldTitle>From</FieldTitle>
            <FieldInfo>
              <TokenAvatar symbol={details.sourceTokenAccount.mint.symbol} size={48} />
              <AddressWrapper>
                <AddressTitle>{details.sourceTokenAccount.mint.symbol}</AddressTitle>
                <AddressValue>
                  {shortAddress(details.sourceTokenAccount.address.toBase58())}
                </AddressValue>
              </AddressWrapper>
            </FieldInfo>
          </ColumnWrapper>
        ) : undefined}
        {details.destinationTokenAccount ? (
          <ColumnWrapper>
            <FieldTitle>To</FieldTitle>
            <FieldInfo>
              <TokenAvatar symbol={details.destinationTokenAccount.mint.symbol} size={48} />
              <AddressWrapper>
                <AddressTitle>{details.destinationTokenAccount.mint.symbol}</AddressTitle>
                <AddressValue>
                  {shortAddress(details.destinationTokenAccount.address.toBase58())}
                </AddressValue>
              </AddressWrapper>
            </FieldInfo>
          </ColumnWrapper>
        ) : undefined}
      </FieldRowWrapper>
    );
  };

  const renderAmountBlock = () => {
    if (details.type === 'swap') {
      return (
        <SwapWrapper>
          <SwapColumn>
            <SwapInfo>
              <TokenAvatar size={44} symbol={details.sourceToken?.symbol} />
              <SwapAmount>
                - {details.sourceAmount.toNumber()} {details.sourceToken?.symbol}
              </SwapAmount>
            </SwapInfo>
          </SwapColumn>
          <SwapBlock>
            <SwapIcon name="swap" />
          </SwapBlock>
          <SwapColumn>
            <SwapInfo>
              <TokenAvatar size={44} symbol={details.destinationToken?.symbol} />
              <SwapAmount>
                + {details.destinationAmount.toNumber()} {details.destinationToken?.symbol}
              </SwapAmount>
            </SwapInfo>
          </SwapColumn>
        </SwapWrapper>
      );
    }

    if (details.typeOriginal) {
      return (
        <SendWrapper>
          <ValueCurrency>
            {details.isReceiver ? '+' : '-'} {details.amount.toNumber()} {details.token?.symbol}
          </ValueCurrency>
          <ValueOriginal>
            <AmountUSD
              prefix={details.isReceiver ? '+' : '-'}
              symbol={details.token?.symbol}
              value={details.amount}
            />
          </ValueOriginal>
        </SendWrapper>
      );
    }
  };

  const date = transaction.timestamp
    ? dayjs.unix(transaction.timestamp).format('LLL')
    : `${transaction.slot} SLOT`;

  return (
    <Wrapper>
      <Header>
        <Title>{details.type}</Title>
        <Desc title={`${transaction.slot} SLOT`}>{date}</Desc>
        <CloseWrapper onClick={close}>
          <CloseIcon name="close" />
        </CloseWrapper>
        <BlockWrapper>{details.icon ? <OtherIcon name={details.icon} /> : undefined}</BlockWrapper>
      </Header>
      <ProgressWrapper />
      <Content>
        {/* {details.typeOriginal === 'transfer' ? ( */}
        {/*  <SendWrapper> */}
        {/*    <ValueCurrency> */}
        {/*      {details.isReceiver ? '+' : '-'} {details.sourceAmount.toNumber()}{' '} */}
        {/*      {details.sourceToken?.symbol} */}
        {/*    </ValueCurrency> */}
        {/*    <ValueOriginal> */}
        {/*      <AmountUSD */}
        {/*        prefix={details.isReceiver ? '+' : '-'} */}
        {/*        symbol={details.sourceToken?.symbol} */}
        {/*        value={details.sourceAmount} */}
        {/*      /> */}
        {/*    </ValueOriginal> */}
        {/*  </SendWrapper> */}
        {/* ) : undefined} */}
        {renderAmountBlock()}
        <StatusWrapper>
          <Status>
            <StatusIndicator /> Completed
          </Status>
        </StatusWrapper>
        <FieldsWrapper>
          {isShowDetails ? (
            <>
              {renderFromTo()}

              <FieldWrapper>
                <FieldTitle>Amount</FieldTitle>
                <FieldValue>
                  {details.type === 'swap' ? (
                    <>
                      {details.sourceAmount.toNumber()} {details.sourceToken?.symbol} to{' '}
                      {details.destinationAmount.toNumber()} {details.destinationToken?.symbol}
                    </>
                  ) : (
                    <>
                      {details.amount.toNumber()} {details.token?.symbol}
                    </>
                  )}
                </FieldValue>
              </FieldWrapper>
              <FieldWrapper>
                <FieldTitle>Value</FieldTitle>
                <FieldValue>
                  <AmountUSD symbol={details.token?.symbol} value={details.amount} />
                </FieldValue>
              </FieldWrapper>
              {transaction.meta ? (
                <FieldWrapper>
                  <FieldTitle>Transaction fee</FieldTitle>
                  <FieldValue>{transaction.meta.fee} lamports</FieldValue>
                </FieldWrapper>
              ) : null}
              <FieldWrapper>
                <FieldTitle>Block number</FieldTitle>
                <FieldValue>#{transaction.slot}</FieldValue>
              </FieldWrapper>
            </>
          ) : undefined}
          <FieldWrapper>
            <FieldTitle>Transaction ID</FieldTitle>
            <FieldValue>
              {signature}{' '}
              <a
                href={getExplorerUrl('tx', signature, cluster)}
                target="_blank"
                rel="noopener noreferrer noindex"
                className="button">
                <ShareWrapper>
                  <ShareIcon name="chain" />
                </ShareWrapper>
              </a>
            </FieldValue>
          </FieldWrapper>
        </FieldsWrapper>
      </Content>
      <Footer className={classNames({ isCentered: true })}>
        <ButtonExplorer lightGray onClick={handleToggleShowDetailsClick}>
          {isShowDetails ? 'Hide transaction details' : 'Show transaction details'}
        </ButtonExplorer>
      </Footer>
    </Wrapper>
  );
};
