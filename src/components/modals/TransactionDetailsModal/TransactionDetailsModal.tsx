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

const BottomIcon = styled(Icon)`
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
  display: flex;
  align-items: center;
  margin-top: 8px;

  color: #000;
  font-size: 14px;
  line-height: 17px;
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
          <BottomIcon name="bottom" />
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
