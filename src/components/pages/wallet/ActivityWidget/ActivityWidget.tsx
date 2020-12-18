import React, { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import * as web3 from '@solana/web3.js';

import { Transaction } from 'api/transaction/Transaction';
import { TransactionList } from 'components/common/TransactionList';
import { Widget } from 'components/common/Widget';
import { RootState } from 'store/rootReducer';
import { getTransactions } from 'store/slices/transaction/TransactionSlice';

const WrapperWidget = styled(Widget)``;

type Props = {
  publicKey: web3.PublicKey;
};

export const ActivityWidget: FunctionComponent<Props> = ({ publicKey }) => {
  const dispatch = useDispatch();
  const order = useSelector((state: RootState) => state.transaction.order[publicKey.toBase58()]);

  useEffect(() => {
    dispatch(getTransactions(publicKey));
  }, [publicKey.toBase58()]);

  return (
    <WrapperWidget title="Activity">
      <TransactionList order={order} />
    </WrapperWidget>
  );
};
