import { useEffect, useMemo, useState } from "react";

import { useDebouncedCallback } from "use-debounce";

import type { TransactionDatum, TransactionFetchResult } from "../";
import { SailTransactionsCacheRefetchError, useSail } from "../";

/**
 * Fetches data of the given signatures.
 * @param keys Keys to fetch. Ensure that this is memoized or unlikely to change.
 *
 * @returns One of three types:
 * - Buffer -- the transaction was found
 * - null -- transaction not found or an error occurred while loading the transaction
 * - undefined -- transaction key not provided or not yet loaded
 */
export const useTransactionsData = (
  keys: (string | null | undefined)[]
): readonly TransactionDatum[] => {
  const {
    transactions: { getDatum, onCache, subscribe, fetchKeys },
    onError,
  } = useSail();

  const [data, setData] = useState<{ [cacheKey: string]: TransactionDatum }>(
    () =>
      keys.reduce<{ [cacheKey: string]: TransactionDatum }>((acc, key) => {
        if (key) {
          acc[key] = getDatum(key);
        }

        return acc;
      }, {})
  );

  // TODO: add cancellation
  const fetchAndSetKeys = useDebouncedCallback(
    async (
      fetchKeys: (
        keys: (string | null | undefined)[]
      ) => Promise<TransactionFetchResult[]>,
      keys: (string | null | undefined)[]
    ) => {
      const keysData = await fetchKeys(keys);
      const nextData = keys.reduce<{ [cacheKey: string]: TransactionDatum }>(
        (cacheState, key, keyIndex) => {
          if (key) {
            cacheState[key] = keysData[keyIndex]?.data;
          }

          return cacheState;
        },
        {}
      );
      setData(nextData);
    },
    100
  );

  useEffect(() => {
    void (async () => {
      await fetchAndSetKeys(fetchKeys, keys)?.catch((e) => {
        onError(new SailTransactionsCacheRefetchError(e, keys));
      });
    })();
  }, [keys, fetchAndSetKeys, fetchKeys, onError]);

  // subscribe to account changes
  useEffect(() => {
    const allKeysUnsubscribe = keys
      .filter((k): k is string => !!k)
      .map(subscribe);
    return () => {
      allKeysUnsubscribe.map((fn) => fn());
    };
  }, [keys, subscribe]);

  // refresh from the cache whenever the cache is updated
  useEffect(() => {
    return onCache((e) => {
      if (keys.find((key) => key === e.id)) {
        void fetchAndSetKeys(fetchKeys, keys)?.catch((e) => {
          onError(new SailTransactionsCacheRefetchError(e, keys));
        });
      }
    });
  }, [keys, onCache, fetchAndSetKeys, fetchKeys, onError]);

  // unload debounces when the component dismounts
  useEffect(() => {
    return () => {
      fetchAndSetKeys.cancel();
    };
  }, [fetchAndSetKeys]);

  return useMemo(() => {
    return keys.map((key) => {
      if (key) {
        return data[key];
      }

      return key as null | undefined;
    });
  }, [data, keys]);
};
