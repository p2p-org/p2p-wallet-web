import { useMemo } from 'react';

import type { CustomParsedTransaction, Transaction } from '../../models';
import { useParsedTransactionData } from '../useParsedTransactionData';
import { TransactionDetails, TransactionInfo } from '../../models';

const transactionDetails = (
  transaction: TransactionInfo | null | undefined,
  source: string,
): TransactionDetails => {
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
};

export const useTransaction = (
  key: string,
  source: string,
): Transaction<CustomParsedTransaction> | undefined => {
  const { loading, data } = useParsedTransactionData(key);

  return useMemo(() => {
    const details = transactionDetails(data?.transactionInfo, source);

    try {
      return {
        key,
        loading,
        data: data ? data.transactionInfo.data : null,
        details,
        raw: data?.raw,
      };
    } catch (e) {
      console.warn(`Error parsing ${data?.transactionId.toString() ?? '(unknown)'}`, e);
      return undefined;
    }
  }, [data, key, loading]);
};
