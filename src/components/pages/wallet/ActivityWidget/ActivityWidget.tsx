import React, { FunctionComponent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import * as web3 from '@solana/web3.js';
import { ConfirmedSignaturesForAddress2Options } from '@solana/web3.js';
import { last } from 'ramda';

import { InfinityScrollHelper } from 'components/common/InfinityScrollHelper';
import { ToastManager } from 'components/common/ToastManager';
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
  const [isLoading, setIsLoading] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const order = useSelector((state: RootState) => state.transaction.order[publicKey.toBase58()]);

  const fetchData = async (isPaging?: boolean) => {
    const options: ConfirmedSignaturesForAddress2Options = {
      limit: 10,
    };

    if (isPaging) {
      options.before = last(order);
    }

    setIsLoading(true);
    try {
      const result = await dispatch(getTransactions({ publicKey, options }));

      if (!result.payload.length) {
        setIsEnd(true);
      }
    } catch (error) {
      ToastManager.error(error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [publicKey.toBase58()]);

  const handleNeedLoadMore = () => {
    void fetchData(true);
  };

  return (
    <WrapperWidget title="Activity">
      <InfinityScrollHelper disabled={isLoading || isEnd} onNeedLoadMore={handleNeedLoadMore}>
        <TransactionList order={order} />
      </InfinityScrollHelper>
    </WrapperWidget>
  );
};
