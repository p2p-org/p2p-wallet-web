import { useMemo } from 'react';

import type { PublicKey } from '@solana/web3.js';

import { useTokenAccountsContext } from '../../../tokenAccounts';
import type {
  CustomParsedTransaction,
  Transaction,
  TransactionDetails,
  TransactionInfo,
} from '../../models';
import { useParsedTransactionData } from '../useParsedTransactionData';

const transactionDetails = (
  transaction: TransactionInfo | null | undefined,
  sources: string[],
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

  return transaction.data.details(sources);
};

export const useTransaction = (
  key: string,
  source?: string,
): Transaction<CustomParsedTransaction> | undefined => {
  const { loading, data } = useParsedTransactionData(key);
  const { userTokenAccountKeys } = useTokenAccountsContext();

  const sources = useMemo(() => {
    if (source) {
      return [source];
    }

    // use user keys if source doesnt provide
    // uses for transaction status modal
    return userTokenAccountKeys.map((v: PublicKey) => v.toBase58());
  }, [source, userTokenAccountKeys]);

  return useMemo(() => {
    const details = transactionDetails(data?.transactionInfo, sources);

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
  }, [data, key, loading, sources]);
};
