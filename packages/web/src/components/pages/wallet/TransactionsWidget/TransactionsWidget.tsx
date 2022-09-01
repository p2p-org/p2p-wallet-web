import type { FunctionComponent } from 'react';
import { useEffect } from 'react';

import { useTransactionSignatures } from '@p2p-wallet-web/core';

import { Empty } from 'components/common/Empty';
import { InfinityScrollHelper } from 'components/common/InfinityScrollHelper';
import { LoaderBlock } from 'components/common/LoaderBlock';
import { ToastManager } from 'components/common/ToastManager';
import { Widget } from 'components/common/Widget';
import { TransactionList } from 'components/pages/wallet/TransactionsWidget/TransactionList';
import { trackEvent } from 'utils/analytics';

const TRANSACTIONS_LIMIT = 10;

type Props = {
  publicKey: string;
};

export const TransactionsWidget: FunctionComponent<Props> = ({ publicKey }) => {
  const [signatures, isLoading, isEnd, fetchTransactionSignatures] = useTransactionSignatures(
    publicKey,
    TRANSACTIONS_LIMIT,
  );

  useEffect(() => {
    if (signatures.length) {
      trackEvent('wallet_activity_scroll', {
        pageNum: Math.floor(signatures.length / TRANSACTIONS_LIMIT),
      });
    }
  }, [signatures]);

  const fetchData = async (isPaging?: boolean) => {
    try {
      await fetchTransactionSignatures(isPaging);
    } catch (error) {
      ToastManager.error((error as Error).message);
    }
  };

  useEffect(() => {
    void fetchData();
  }, [publicKey]);

  const handleNeedLoadMore = () => {
    void fetchData(true);
  };

  return (
    <Widget title="Activity">
      <InfinityScrollHelper disabled={isLoading || isEnd} onNeedLoadMore={handleNeedLoadMore}>
        <TransactionList signatures={signatures} source={publicKey} />
        {isLoading ? <LoaderBlock /> : undefined}
        {!isLoading && !signatures?.length ? (
          <Empty
            type="activity"
            title="No transactions yet"
            desc="You didn’t make any transactions yet"
          />
        ) : undefined}
      </InfinityScrollHelper>
    </Widget>
  );
};
