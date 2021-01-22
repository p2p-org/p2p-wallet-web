import React, { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import * as web3 from '@solana/web3.js';
import dayjs from 'dayjs';
import { rgba } from 'polished';

import { Transaction } from 'api/transaction/Transaction';
import { ToastManager } from 'components/common/ToastManager';
import { TokenAvatar } from 'components/common/TokenAvatar';
import { Icon } from 'components/ui';
import { RootState } from 'store/rootReducer';
import { getTransaction } from 'store/slices/transaction/TransactionSlice';

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

  background: #f6f6f8;
`;

const Date = styled.div`
  color: #a3a5ba;
  font-weight: 600;
  font-size: 16px;
  line-height: 100%;
  text-align: center;
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

const Content = styled.div``;

const StatusWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 40px 0 20px;
`;

const Value = styled.div`
  color: #000;
  font-weight: 600;
  font-size: 28px;
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

  border-bottom: 1px solid ${rgba('#000', 0.05)};

  &:first-child {
    border-top: 1px solid ${rgba('#000', 0.05)};
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

const AddressWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 0 9px 0 10px;
`;

const AddressTitle = styled.div`
  margin-bottom: 6px;

  color: #000;
  font-weight: 500;
  font-size: 14px;
  line-height: 100%;
`;

const AddressValue = styled.div`
  color: ${rgba('#000', 0.5)};
  font-size: 12px;
  line-height: 120%;
`;

const CopyWrapper = styled.div`
  cursor: pointer;
`;

const CopyIcon = styled(Icon)`
  width: 24px;
  height: 24px;
`;

// const ButtonExplorer = styled(Button)`
//   color: ${rgba('#000', 0.5)};
// `;

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
    (state: RootState) =>
      state.transaction.items[signature] && Transaction.from(state.transaction.items[signature]),
  );

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

  if (!transaction) {
    return null;
  }

  const date = transaction.timestamp
    ? dayjs.unix(transaction.timestamp).format('LLL')
    : `${transaction.slot} SLOT`;

  return (
    <Wrapper>
      <Header>
        <Date title={`${transaction.slot} SLOT`}>{date}</Date>
        <CloseWrapper onClick={close}>
          <CloseIcon name="close" />
        </CloseWrapper>
        <BlockWrapper>
          <BlockIcon name="bottom" />
        </BlockWrapper>
      </Header>
      <Content>
        <StatusWrapper>
          <Value>
            {transaction.short.amount.toNumber()}{' '}
            {transaction.short.sourceTokenAccount?.mint.symbol}
          </Value>
          <Status>Completed</Status>
        </StatusWrapper>
        <FieldsWrapper>
          {transaction.short.sourceTokenAccount ? (
            <FieldWrapper>
              <FieldTitle>From</FieldTitle>
              <FieldValue>
                <TokenAvatar symbol={undefined} size={40} />
                <AddressWrapper>
                  <AddressTitle>{transaction.short.sourceTokenAccount.mint.symbol}</AddressTitle>
                  <AddressValue>
                    {transaction.short.sourceTokenAccount.address.toBase58()}
                  </AddressValue>
                </AddressWrapper>
                <CopyWrapper
                  onClick={handleCopyClick(
                    transaction.short.sourceTokenAccount.address.toBase58(),
                  )}>
                  <CopyIcon name="copy" />
                </CopyWrapper>
              </FieldValue>
            </FieldWrapper>
          ) : undefined}
          {transaction.short.destinationTokenAccount ? (
            <FieldWrapper>
              <FieldTitle>To</FieldTitle>
              <FieldValue>
                <TokenAvatar symbol={undefined} size={40} />
                <AddressWrapper>
                  <AddressTitle>
                    {transaction.short.destinationTokenAccount.mint.symbol}
                  </AddressTitle>
                  <AddressValue>
                    {transaction.short.destinationTokenAccount.address.toBase58()}
                  </AddressValue>
                </AddressWrapper>
                <CopyWrapper
                  onClick={handleCopyClick(
                    transaction.short.destinationTokenAccount.address.toBase58(),
                  )}>
                  <CopyIcon name="copy" />
                </CopyWrapper>
              </FieldValue>
            </FieldWrapper>
          ) : undefined}
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
            <FieldValue>{signature}</FieldValue>
          </FieldWrapper>
        </FieldsWrapper>
        {/* <ButtonExplorer */}
        {/*  gray */}
        {/*  as="a" */}
        {/*  href={`https://explorer.solana.com/tx/${signature}?cluster=${cluster}`}> */}
        {/*  View in blockchain explorer */}
        {/* </ButtonExplorer> */}
      </Content>
    </Wrapper>
  );
};
