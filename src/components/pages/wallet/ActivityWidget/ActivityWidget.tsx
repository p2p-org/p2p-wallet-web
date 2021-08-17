import React, { FunctionComponent, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { styled } from '@linaria/react';
import { unwrapResult } from '@reduxjs/toolkit';
import { ConfirmedSignaturesForAddress2Options, PublicKey } from '@solana/web3.js';
import { last } from 'ramda';

import { Empty } from 'components/common/Empty';
import { InfinityScrollHelper } from 'components/common/InfinityScrollHelper';
import { LoaderBlock } from 'components/common/LoaderBlock';
import { ToastManager } from 'components/common/ToastManager';
import { Widget } from 'components/common/Widget';
import { TransactionList } from 'components/pages/wallet/ActivityWidget/TransactionList';
import {
  getTransactions,
  setCurrentHistoryPubkey,
  updateTransactions,
} from 'store/slices/transaction/TransactionSlice';
import { trackEvent } from 'utils/analytics';

const WrapperWidget = styled(Widget)``;

const LIMIT = 10;

type Props = {
  publicKey: string;
};

export const ActivityWidget: FunctionComponent<Props> = ({ publicKey }) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const order = useSelector((state) => state.transaction.order[publicKey]);
  const isNeedUpdateTransactions = useSelector(
    (state) => state.transaction.isNeedUpdateTransactions,
  );

  useEffect(() => {
    if (order?.length) {
      trackEvent('wallet_activity_scroll', { pageNum: Math.floor(order.length / LIMIT) });
    }
  }, [order]);

  const fetchData = async (isPaging?: boolean) => {
    setIsLoading(true);
    try {
      const options: ConfirmedSignaturesForAddress2Options = {
        limit: LIMIT,
      };

      if (isPaging) {
        options.before = order ? last(order) : undefined;
      }

      const result = unwrapResult(
        await dispatch(getTransactions({ publicKey: new PublicKey(publicKey), options })),
      );

      if (result.length === 0) {
        setIsEnd(true);
      }
    } catch (error) {
      ToastManager.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
    dispatch(setCurrentHistoryPubkey(publicKey));

    return function cleanup() {
      dispatch(setCurrentHistoryPubkey(null));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, publicKey]);

  useEffect(() => {
    if (isNeedUpdateTransactions) {
      void fetchData();
      dispatch(updateTransactions(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNeedUpdateTransactions]);

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
