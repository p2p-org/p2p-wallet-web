import React, { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import * as web3 from '@solana/web3.js';
import dayjs from 'dayjs';
import { rgba } from 'polished';

import { Transaction } from 'api/transaction/Transaction';
import { Icon } from 'components/ui';
import { getTransaction } from 'features/transaction/TransactionSlice';
import { RootState } from 'store/rootReducer';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  flex-basis: 588px;
  flex-direction: column;

  background-color: #fff;
  border-radius: 15px;
`;

const Header = styled.div`
  position: relative;

  padding: 20px 20px 48px;

  border-bottom: 1px solid ${rgba('#000', 0.05)};
`;

const Title = styled.div`
  color: #000;
  font-size: 14px;
  line-height: 17px;
  text-align: center;
`;

const CloseWrapper = styled.div``;

const CloseIcon = styled(Icon)`
  position: absolute;
  top: 15px;
  right: 15px;

  width: 32px;
  height: 32px;

  cursor: pointer;
`;

const CircleWrapper = styled.div`
  position: absolute;
  bottom: -28px;
  left: 50%;

  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-left: -28px;

  background: #e1e1e1;
  border-radius: 50%;
`;

const ArrowAngleIcon = styled(Icon)`
  width: 17px;
  height: 17px;
`;

const Content = styled.div`
  padding: 0 30px 24px;
`;

const StatusWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 52px 0 32px;
`;

const Value = styled.div`
  color: #000;
  font-weight: 500;
  font-size: 28px;
  line-height: 33px;
`;

const Status = styled.div`
  margin-top: 12px;
  padding: 5px 16px;

  color: ${rgba('#000', 0.5)};
  font-weight: bold;
  font-size: 12px;
  line-height: 14px;

  background: #f4f4f4;
  border-radius: 8px;
`;

const FieldsWrapper = styled.div``;

const FieldWrapper = styled.div`
  padding: 20px 0;

  border-bottom: 1px solid ${rgba('#000', 0.05)};

  &:first-child {
    border-top: 1px solid ${rgba('#000', 0.05)};
  }
`;

const FieldTitle = styled.div`
  color: ${rgba('#000', 0.5)};
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
`;

const FieldValue = styled.div`
  margin-top: 8px;

  color: #000;
  font-size: 14px;
  line-height: 17px;
`;

type Props = {
  signature: web3.TransactionSignature;
  close: () => void;
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

  return (
    <Wrapper>
      <Header>
        <Title title={`${transaction.slot} SLOT`}>
          {transaction.timestamp
            ? dayjs.unix(transaction.timestamp).format('LLL')
            : `${transaction.slot} SLOT`}
        </Title>
        <CloseWrapper onClick={close}>
          <CloseIcon name="close" />
        </CloseWrapper>
        <CircleWrapper>
          <ArrowAngleIcon name="arrow-angle" />
        </CircleWrapper>
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
          <FieldWrapper>
            <FieldTitle>Transaction ID</FieldTitle>
            <FieldValue>{signature}</FieldValue>
          </FieldWrapper>
          <FieldWrapper>
            <FieldTitle>Amount</FieldTitle>
            <FieldValue>{transaction.short.amount.toNumber()}</FieldValue>
            {/* <FieldValue>0,00344 BTC at 12 902, 07 US$</FieldValue> */}
          </FieldWrapper>
          <FieldWrapper>
            <FieldTitle>Value</FieldTitle>
            <FieldValue>{transaction.short.amount.toNumber()}</FieldValue>
            {/* <FieldValue>0,00344 BTC at 12 902, 07 US$</FieldValue> */}
          </FieldWrapper>
          {transaction.meta ? (
            <FieldWrapper>
              <FieldTitle>Fee</FieldTitle>
              <FieldValue>{transaction.meta.fee} lamports</FieldValue>
              {/* <FieldValue>0,00009492 BTC</FieldValue> */}
            </FieldWrapper>
          ) : null}
        </FieldsWrapper>
      </Content>
    </Wrapper>
  );
};
