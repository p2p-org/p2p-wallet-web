import React, { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import bgImg from 'assets/images/sun.png';
import { rgba } from 'polished';

import { Transaction } from 'api/transaction/Transaction';
import { Card } from 'components/common/Card';
import { Button, Icon } from 'components/ui';
import { openModal } from 'store/_actions/modals';
import { SHOW_MODAL_TRANSACTION_DETAILS } from 'store/constants/modalTypes';
import { RootState } from 'store/rootReducer';
import { getTransaction } from 'store/slices/transaction/TransactionSlice';

const WrapperCard = styled(Card)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
`;

const HeaderImage = styled.div`
  width: 175px;
  height: 183px;
  margin-bottom: 32px;

  background-image: url(${bgImg});
  background-repeat: no-repeat;
  background-size: 183px 175px;
`;

const CircleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin: 32px -4px 24px 0;

  background: #e1e1e1;
  border-radius: 50%;
`;

const ArrowIcon = styled(Icon)`
  width: 17px;
  height: 17px;

  transform: rotate(180deg);
`;

const InfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
`;

const Value = styled.div`
  color: #000;
  font-weight: 500;
  font-size: 28px;
  line-height: 33px;
`;

const Status = styled.div`
  display: flex;
  align-items: center;
  height: 24px;
  margin: 12px 0;
  padding: 0 16px;

  color: ${rgba('#000', 0.5)};
  font-weight: bold;
  font-size: 12px;
  line-height: 14px;

  background: #f4f4f4;
  border-radius: 8px;
`;

const Details = styled.div`
  color: ${rgba('#000', 0.5)};
  font-size: 14px;
  line-height: 140%;

  cursor: pointer;
`;

export const ResultWidget: FunctionComponent = () => {
  const { state: locationState } = useLocation<{ signature: string }>();
  const dispatch = useDispatch();
  const transaction = useSelector(
    (state: RootState) =>
      state.transaction.items[locationState.signature] &&
      Transaction.from(state.transaction.items[locationState.signature]),
  );

  useEffect(() => {
    const mount = async () => {
      const trx = unwrapResult(await dispatch(getTransaction(locationState?.signature)));

      if (!trx) {
        setTimeout(mount, 3000);
      }
    };

    void mount();
  }, []);

  const handleDetailsClick = () => {
    dispatch(openModal(SHOW_MODAL_TRANSACTION_DETAILS, { signature: locationState?.signature }));
  };

  return (
    <WrapperCard>
      <HeaderImage />
      <CircleWrapper>
        <ArrowIcon name="arrow-angle" />
      </CircleWrapper>
      <InfoWrapper>
        {transaction ? (
          <Value>
            {transaction.short.amount.toNumber()}{' '}
            {transaction.short.sourceTokenAccount?.mint.symbol}
          </Value>
        ) : undefined}
        <Status>{transaction ? 'Processed' : 'Processing'}</Status>
        {transaction ? (
          <Details onClick={handleDetailsClick}>Transaction details</Details>
        ) : undefined}
      </InfoWrapper>
      {transaction?.short.source ? (
        <Button primary big full as={Link} to={`/wallet/${transaction.short.source.toBase58()}`}>
          Go back to wallet
        </Button>
      ) : undefined}
    </WrapperCard>
  );
};
