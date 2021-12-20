import { useMemo } from 'react';

import { useParsedTransactionData } from '../useParsedTransactionData';
import { useTransactionDetails } from '../useTransactionDetails';
// import { parseTransaction } from '../useParsedTransactionsData/parser';

// export const useTransaction = (key: string) => {
//   const { data } = useTransactionData(key);
//
//   return useMemo(() => {
//     const parsed = data
//       ? parseTransaction(data.transactionInfo as ParsedConfirmedTransaction)
//       : data;
//
//     try {
//       return {
//         key,
//         loading: data === undefined,
//         data: parsed ? parsed : null,
//         raw: data?.transactionInfo,
//       };
//     } catch (e) {
//       console.warn(`Error parsing ${data?.transactionId.toString() ?? '(unknown)'}`, e);
//       return undefined;
//     }
//   }, [data, key]);
// };

export const useTransaction = (key: string, source: string) => {
  const { loading, data } = useParsedTransactionData(key);
  const details = useTransactionDetails(data?.transactionInfo, source);

  return useMemo(() => {
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
