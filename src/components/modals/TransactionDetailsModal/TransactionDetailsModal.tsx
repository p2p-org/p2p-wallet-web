import React, { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import * as web3 from '@solana/web3.js';
import { styled } from 'linaria/react';
import { rgba } from 'polished';

import { Icon } from 'components/ui';
import { getConfirmedTransaction } from 'store/_actions/solana';
import { RootState } from 'store/types';
import { useTransactionInfo } from 'utils/hooks/useTransactionInfo';

const Wrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;
  flex-basis: 588px;

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

  const { slot, symbol, amount, meta } = useTransactionInfo(signature);

  useEffect(() => {
    const mount = async () => {
      const trx = await dispatch(getConfirmedTransaction(signature));

      if (!trx) {
        setTimeout(mount, 3000);
      }
    };

    if (!signature) {
      void mount();
    }
  }, [signature]);

  if (!slot) {
    return null;
  }

  return (
    <Wrapper>
      <Header>
        {/* <Title>24 Oct 2020 @ 12:51 PM</Title> */}
        <Title>{slot} SLOT</Title>
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
            {amount} {symbol}
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
            <FieldValue>{amount}</FieldValue>
            {/* <FieldValue>0,00344 BTC at 12 902, 07 US$</FieldValue> */}
          </FieldWrapper>
          <FieldWrapper>
            <FieldTitle>Value</FieldTitle>
            <FieldValue>{amount}</FieldValue>
            {/* <FieldValue>0,00344 BTC at 12 902, 07 US$</FieldValue> */}
          </FieldWrapper>
          {meta ? (
            <FieldWrapper>
              <FieldTitle>Fee</FieldTitle>
              <FieldValue>{meta.fee} lamports</FieldValue>
              {/* <FieldValue>0,00009492 BTC</FieldValue> */}
            </FieldWrapper>
          ) : null}
        </FieldsWrapper>
      </Content>
    </Wrapper>
  );
};
