import React, { FunctionComponent, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import * as web3 from '@solana/web3.js';
import dayjs from 'dayjs';
import { rgba } from 'polished';

import { Transaction } from 'api/transaction/Transaction';
import { AmountUSDT } from 'components/common/AmountUSDT';
import { ToastManager } from 'components/common/ToastManager';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Button, Icon } from 'components/ui';
import { getTransaction } from 'store/slices/transaction/TransactionSlice';
import { getExplorerUrl } from 'utils/connection';
import { shortAddress } from 'utils/tokens';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  flex-basis: 524px;
  flex-direction: column;
  overflow: hidden;

  background: #f6f6f8;

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

const Date = styled.div`
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

  background: #fff;
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
`;

const BlockIcon = styled(Icon)`
  width: 25px;
  height: 25px;

  color: #fff;
`;

const Content = styled.div`
  background: #fff;
  border-radius: 0 0 15px 15px;
`;

const StatusWrapper = styled.div`
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

const Status = styled.div`
  display: flex;
  align-items: center;
  height: 32px;
  margin-top: 20px;
  padding: 6px 12px;

  color: #17971d;
  font-weight: 600;
  font-size: 13px;
  line-height: 20px;

  background: rgba(45, 181, 51, 0.3);
  border-radius: 10px;
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

const AddressWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 0 9px 0 12px;
`;

const AddressTitle = styled.div`
  color: #000;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
`;

const AddressValue = styled.div`
  margin-bottom: 5px;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 16px;
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
  justify-content: center;
  height: 85px;

  background: #f6f6f8;
`;

const ButtonExplorer = styled(Button)`
  font-weight: 600;
  font-size: 14px;
  line-height: 150%;
`;

type Props = {
  signature: web3.TransactionSignature;
  close: () => void;
};

const handleCopyClick = (publicKey: string) => () => {
  try {
    void navigator.clipboard.writeText(publicKey);
    ToastManager.info('Copied to buffer!');
  } catch (error) {
    console.error(error);
  }
};

export const TransactionDetailsModal: FunctionComponent<Props> = ({ signature, close }) => {
  const dispatch = useDispatch();
  const transaction = useSelector(
    (state) =>
      state.transaction.items[signature] && Transaction.from(state.transaction.items[signature]),
  );
  const cluster = useSelector((state) => state.wallet.cluster);
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

  const isReceiver = useMemo(() => {
    return tokenAccounts.find(
      (tokenAccount) => tokenAccount.address === transaction.short.destination?.toBase58(),
    );
  }, [transaction.short.destination, tokenAccounts]);

  if (!transaction) {
    return null;
  }

  const date = transaction.timestamp
    ? dayjs.unix(transaction.timestamp).format('LLL')
    : `${transaction.slot} SLOT`;

  return (
    <Wrapper>
      <Header>
        <Title>{transaction.short.type}</Title>
        <Date title={`${transaction.slot} SLOT`}>{date}</Date>
        <CloseWrapper onClick={close}>
          <CloseIcon name="close" />
        </CloseWrapper>
        <BlockWrapper>
          <BlockIcon name={isReceiver ? 'bottom' : 'top'} />
        </BlockWrapper>
      </Header>
      <Content>
        <StatusWrapper>
          <ValueCurrency>
            <AmountUSDT
              prefix={isReceiver ? '+' : '-'}
              symbol={transaction.short.sourceTokenAccount?.mint.symbol}
              value={transaction.short.amount}
            />
          </ValueCurrency>
          <ValueOriginal>
            {isReceiver ? '+' : '-'} {transaction.short.amount.toNumber()}{' '}
            {transaction.short.sourceTokenAccount?.mint.symbol}
          </ValueOriginal>
          <Status>Completed</Status>
        </StatusWrapper>
        <FieldsWrapper>
          <FieldRowWrapper>
            {transaction.short.sourceTokenAccount ? (
              <ColumnWrapper>
                <FieldTitle>From</FieldTitle>
                <FieldInfo>
                  <TokenAvatar
                    symbol={transaction.short.sourceTokenAccount.mint.symbol}
                    size={48}
                  />
                  <AddressWrapper>
                    <AddressTitle>{transaction.short.sourceTokenAccount.mint.symbol}</AddressTitle>
                    <AddressValue>
                      {shortAddress(transaction.short.sourceTokenAccount.address.toBase58())}
                    </AddressValue>
                  </AddressWrapper>
                </FieldInfo>
              </ColumnWrapper>
            ) : undefined}
            {transaction.short.destinationTokenAccount ? (
              <ColumnWrapper>
                <FieldTitle>To</FieldTitle>
                <FieldInfo>
                  <TokenAvatar
                    symbol={transaction.short.destinationTokenAccount.mint.symbol}
                    size={48}
                  />
                  <AddressWrapper>
                    <AddressTitle>
                      {transaction.short.destinationTokenAccount.mint.symbol}
                    </AddressTitle>
                    <AddressValue>
                      {shortAddress(transaction.short.destinationTokenAccount.address.toBase58())}
                    </AddressValue>
                  </AddressWrapper>
                </FieldInfo>
              </ColumnWrapper>
            ) : undefined}
          </FieldRowWrapper>
          <FieldWrapper>
            <FieldTitle>Date</FieldTitle>
            <FieldValue>{date}</FieldValue>
          </FieldWrapper>
          <FieldWrapper>
            <FieldTitle>Amount</FieldTitle>
            <FieldValue>{transaction.short.amount.toNumber()}</FieldValue>
          </FieldWrapper>
          <FieldWrapper>
            <FieldTitle>Value</FieldTitle>
            <FieldValue>{transaction.short.amount.toNumber()}</FieldValue>
          </FieldWrapper>
          {transaction.meta ? (
            <FieldWrapper>
              <FieldTitle>Fee</FieldTitle>
              <FieldValue>{transaction.meta.fee} lamports</FieldValue>
            </FieldWrapper>
          ) : null}
          <FieldWrapper>
            <FieldTitle>Block number</FieldTitle>
            <FieldValue>#{transaction.slot}</FieldValue>
          </FieldWrapper>
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
      </Content>
      <Footer>
        <a
          href={getExplorerUrl('tx', signature, cluster)}
          target="_blank"
          rel="noopener noreferrer noindex"
          className="button">
          <ButtonExplorer secondary>View in blockchain explorer</ButtonExplorer>
        </a>
      </Footer>
    </Wrapper>
  );
};
