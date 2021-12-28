import { useMemo } from 'react';

import type { ParsedTransactionDatum } from '../index';
import { useParsedTransactionsData } from './useParsedTransactionsData';

/**
 * Loads the parsed data of a single transaction.
 * @returns
 */
export const useParsedTransactionData = (
  key: string | null | undefined,
): { loading: boolean; data: ParsedTransactionDatum } => {
  const theKey = useMemo(() => [key], [key]);
  const [data] = useParsedTransactionsData(theKey);
  return {
    loading: key !== undefined && data === undefined,
    data,
  };
};
