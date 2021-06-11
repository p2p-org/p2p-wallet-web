import React, { FunctionComponent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import * as web3 from '@solana/web3.js';
import { ConfirmedSignaturesForAddress2Options } from '@solana/web3.js';
import { last } from 'ramda';

import { Empty } from 'components/common/Empty';
import { InfinityScrollHelper } from 'components/common/InfinityScrollHelper';
import { LoaderBlock } from 'components/common/LoaderBlock';
import { ToastManager } from 'components/common/ToastManager';
import { Widget } from 'components/common/Widget';
import { TransactionList } from 'components/pages/wallet/ActivityWidget/TransactionList';
import { RootState } from 'store/rootReducer';
import { getTransactions } from 'store/slices/transaction/TransactionSlice';
import { trackEvent } from 'utils/analytics';

const WrapperWidget = styled(Widget)``;

const LIMIT = 10;

type Props = {
  publicKey: web3.PublicKey;
};

export const ActivityWidget: FunctionComponent<Props> = ({ publicKey }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const order = useSelector((state: RootState) => state.transaction.order[publicKey.toBase58()]);

  useEffect(() => {
    trackEvent('wallet_activity_scroll', { pageNum: Math.floor(order.length / LIMIT) });
  }, [order]);

  const fetchData = async (isPaging?: boolean) => {
    const options: ConfirmedSignaturesForAddress2Options = {
      limit: LIMIT,
    };

    if (isPaging) {
      options.before = order ? last(order) : undefined;
    }

    setIsLoading(true);
    try {
      const result = unwrapResult(await dispatch(getTransactions({ publicKey, options })));

      if (result.length === 0) {
        setIsEnd(true);
      }
    } catch (error) {
      ToastManager.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNeedLoadMore = () => {
    void fetchData(true);
  };

  return (
    <WrapperWidget title="Activity">
      <InfinityScrollHelper disabled={isLoading || isEnd} onNeedLoadMore={handleNeedLoadMore}>
        <TransactionList order={order} source={publicKey} />
        {isLoading ? <LoaderBlock /> : undefined}
        {!isLoading && !order?.length ? (
          <Empty
            type="activity"
            title="No transactions yet"
            desc="You didn’t make any transactions yet"
          />
        ) : undefined}
      </InfinityScrollHelper>
    </WrapperWidget>
  );
};
