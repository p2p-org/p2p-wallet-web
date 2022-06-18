import { useMemo } from "react";

import type { TransactionDatum } from "../internal";
import { useTransactionsData } from "./useTransactionsData";

export const useTransactionData = (
  key?: string | null
): { loading: boolean; data: TransactionDatum } => {
  const theKey = useMemo(() => [key], [key]);
  const [data] = useTransactionsData(theKey);
  return {
    loading: key !== undefined && data === undefined,
    data,
  };
};
