import zip from "lodash.zip";
import invariant from "tiny-invariant";

import { SailTransactionLoadError } from "../../errors";
import type { TransactionFetchResult } from "./types";
import type { TransactionLoader } from "./useTransactionsInternal";

export const fetchKeysUsingLoader = async (
  loader: TransactionLoader,
  keys: (string | null | undefined)[]
): Promise<TransactionFetchResult[]> => {
  const keysWithIndex = keys.map((k, i) => [k, i]);
  const keysSpecified = keysWithIndex.filter(
    (args): args is [string, number] => !!args[0]
  );
  const result = await loader.loadMany(keysSpecified.map((k) => k[0]));
  const nextData: TransactionFetchResult[] = keys.map(() => ({
    data: undefined,
  }));
  zip(keysSpecified, result).forEach(([indexInfo, keyResult]) => {
    invariant(indexInfo, "index info missing");
    invariant(keyResult !== undefined, "key result missing");

    const [transactionId, nextIndex] = indexInfo;
    if (keyResult instanceof Error) {
      return (nextData[nextIndex] = {
        data: null,
        error: new SailTransactionLoadError(keyResult, transactionId),
      });
    }
    return (nextData[nextIndex] = {
      data: keyResult
        ? {
            transactionId,
            transactionInfo: keyResult,
          }
        : null,
    });
  });
  return nextData;
};
