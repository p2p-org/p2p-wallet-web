import { useMemo } from 'react';

import type { TransactionDetails, TransactionInfo } from '..';

export const useTransactionDetails = (
  // transaction: Transaction<CustomParsedTransaction> | null | undefined,
  transaction: TransactionInfo | null | undefined,
  source: string,
): TransactionDetails => {
  return useMemo(() => {
    if (!transaction?.data) {
      return {
        type: 'transaction',
        icon: 'db',
        isReceiver: false,
      };
    }

    // TODO: Do ren btc parsers
    // else if (type === 'mintRenBTC') {
    //   icon = 'bottom';
    //   isReceiver = true;
    // } else if (type === 'burnRenBTC') {
    //   icon = 'top';
    // }

    return transaction.data.details(source);
  }, [source, transaction?.data]);
};
