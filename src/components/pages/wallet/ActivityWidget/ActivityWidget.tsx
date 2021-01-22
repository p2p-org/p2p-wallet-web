import React, { FunctionComponent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import * as web3 from '@solana/web3.js';
import { ConfirmedSignaturesForAddress2Options } from '@solana/web3.js';
import { last } from 'ramda';

import { InfinityScrollHelper } from 'components/common/InfinityScrollHelper';
import { LoaderBlock } from 'components/common/LoaderBlock';
import { ToastManager } from 'components/common/ToastManager';
import { TransactionList } from 'components/common/TransactionList';
import { Widget } from 'components/common/Widget';
import { RootState } from 'store/rootReducer';
import { getTransactions } from 'store/slices/transaction/TransactionSlice';

const WrapperWidget = styled(Widget)``;

const EmptyWrapper = styled.div`
  margin: 20px 0;

  color: #a3a5ba;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
`;

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
      const result = unwrapResult(await dispatch(getTransactions({ publicKey, options })));

      if (result.length === 0) {
        setIsEnd(true);
      }
    } catch (error) {
      ToastManager.error(String(error));
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

  const renderEmpty = () => {
    return <EmptyWrapper>History is empty</EmptyWrapper>;
  };

  return (
    <WrapperWidget title="Activity">
      <InfinityScrollHelper disabled={isLoading || isEnd} onNeedLoadMore={handleNeedLoadMore}>
        <TransactionList order={order} />
        {isLoading ? <LoaderBlock /> : undefined}
        {!isLoading && !order?.length ? renderEmpty() : undefined}
      </InfinityScrollHelper>
    </WrapperWidget>
  );
};
