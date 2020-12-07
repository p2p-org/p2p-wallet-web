import React, { FunctionComponent, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import * as web3 from '@solana/web3.js';

import { Transaction } from 'api/transaction/Transaction';
import { TransactionList } from 'components/common/TransactionList';
import { Widget } from 'components/common/Widget';
import { getTransactions } from 'features/transaction/TransactionSlice';
import { RootState } from 'store/rootReducer';

const WrapperWidget = styled(Widget)``;

type Props = {
  publicKey: web3.PublicKey;
};

export const ActivityWidget: FunctionComponent<Props> = ({ publicKey }) => {
  const dispatch = useDispatch();
  const transactions = useSelector((state: RootState) =>
    state.transaction[publicKey.toBase58()]?.map((transaction) => Transaction.from(transaction)),
  );

  useEffect(() => {
    dispatch(getTransactions(publicKey));
  }, [publicKey.toBase58()]);

  return (
    <WrapperWidget title="Activity">
      <TransactionList items={transactions} />
    </WrapperWidget>
  );
};
