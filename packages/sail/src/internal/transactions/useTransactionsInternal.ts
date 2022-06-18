import { useCallback, useEffect, useMemo, useState } from "react";
import { unstable_batchedUpdates } from "react-dom";

import { useConnectionContext } from "@saberhq/use-solana";
import type { ParsedConfirmedTransaction } from "@solana/web3.js";
import DataLoader from "dataloader";

import type {
  SailError,
  TransactionDatum,
  TransactionFetchResult,
} from "../../";
import { SailRefetchSubscriptionsError } from "../../";
import type { CacheUpdateEvent } from "./emitter";
import { TransactionsEmitter } from "./emitter";
import { fetchKeysUsingLoader } from "./fetchKeysUsingLoader";
import { getMultipleTransactions } from "./utils/getMultipleTransactions";

export type TransactionLoader = DataLoader<
  string,
  ParsedConfirmedTransaction | null,
  string
>;

export type TransactionsCache = Map<string, ParsedConfirmedTransaction | null>;

interface TransactionsProviderState {
  transactionsCache: TransactionsCache;
  emitter: TransactionsEmitter;
  subscribedTransactions: Map<string, number>;
}

const newState = (): TransactionsProviderState => ({
  transactionsCache: new Map<string, ParsedConfirmedTransaction | null>(),
  emitter: new TransactionsEmitter(),
  subscribedTransactions: new Map(),
});

export interface UseTransactionsArgs {
  /**
   * Duration in ms in which to batch all transactions data requests. Defaults to 500ms.
   */
  batchDurationMs?: number;
  /**
   * Milliseconds between each refresh. Defaults to 60_000.
   */
  refreshIntervalMs?: number;
  /**
   * Called whenever an error occurs.
   */
  onError: (err: SailError) => void;
}

export interface UseTransactions extends Omit<UseTransactionsArgs, "onError"> {
  /**
   * The loader. Usually should not be used directly.
   */
  loader: TransactionLoader;
  /**
   * Cache of transactions
   */
  transactionsCache: TransactionsCache;
  /**
   * Emitter of transactions
   */
  emitter: TransactionsEmitter;

  /**
   * Refetches a transaction.
   */
  refetch: (key: string) => Promise<ParsedConfirmedTransaction | null>;
  /**
   * Refetches multiple transactions.
   */
  refetchMany: (
    keys: string[]
  ) => Promise<(ParsedConfirmedTransaction | Error | null)[]>;
  /**
   * Refetches all transactions that are being subscribed to.
   */
  refetchAllSubscriptions: () => Promise<void>;

  /**
   * Registers a callback to be called whenever an item is cached.
   */
  onCache: (cb: (args: CacheUpdateEvent) => void) => void;

  /**
   * Fetches the data associated with the given keys, via the transactionLoader.
   */
  fetchKeys: (
    keys: (string | null | undefined)[]
  ) => Promise<TransactionFetchResult[]>;

  /**
   * Causes a key to be refetched periodically.
   */
  subscribe: (key: string) => () => Promise<void>;

  /**
   * Gets the cached data of a transaction.
   */
  getCached: (key: string) => ParsedConfirmedTransaction | null | undefined;
  /**
   * Gets an TransactionDatum from a key.
   */
  getDatum: (key: string | null | undefined) => TransactionDatum;
}

export const useTransactionsInternal = (
  args: UseTransactionsArgs
): UseTransactions => {
  const { batchDurationMs = 500, refreshIntervalMs = 60_000, onError } = args;
  const { network, connection } = useConnectionContext();

  // Cache of transactions
  const [{ transactionsCache, emitter, subscribedTransactions }, setState] =
    useState<TransactionsProviderState>(newState());

  useEffect(() => {
    setState((prevState) => {
      // clear transactions cache and subscriptions whenever the network changes
      prevState.transactionsCache.clear();
      prevState.subscribedTransactions.clear();
      prevState.emitter.raiseCacheCleared();
      return newState();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  const transactionLoader = useMemo(
    () =>
      new DataLoader<string, ParsedConfirmedTransaction | null, string>(
        async (keys: readonly string[]) => {
          const result = await getMultipleTransactions(
            connection,
            keys,
            onError,
            "confirmed"
          );
          unstable_batchedUpdates(() => {
            result.array.forEach((info, i) => {
              const addr = keys[i];
              if (addr && !(info instanceof Error)) {
                transactionsCache.set(addr, info);
                emitter.raiseCacheUpdated(addr, true);
              }
            });
          });
          return result.array;
        },
        {
          // aggregate all requests over 500ms
          batchScheduleFn: (callback) => setTimeout(callback, batchDurationMs),
          // cacheKeyFn: getCacheKeyOfPublicKey,
        }
      ),
    [transactionsCache, batchDurationMs, connection, emitter, onError]
  );

  const fetchKeys = useCallback(
    async (keys: (string | null | undefined)[]) => {
      return await fetchKeysUsingLoader(transactionLoader, keys);
    },
    [transactionLoader]
  );

  const onCache = useMemo(() => emitter.onCache.bind(emitter), [emitter]);

  const refetch = useCallback(
    async (key: string) => {
      const result = await transactionLoader.clear(key).load(key);
      return result;
    },
    [transactionLoader]
  );

  const refetchMany = useCallback(
    async (keys: string[]) => {
      keys.forEach((key) => {
        transactionLoader.clear(key);
      });
      return await transactionLoader.loadMany(keys);
    },
    [transactionLoader]
  );

  const getCached = useCallback(
    (key: string): ParsedConfirmedTransaction | null | undefined => {
      // null: account not found on blockchain
      // undefined: cache miss (not yet fetched)
      return transactionsCache.get(key);
    },
    [transactionsCache]
  );

  const subscribe = useCallback(
    (key: string): (() => Promise<void>) => {
      const amount = subscribedTransactions.get(key);
      if (amount === undefined || amount === 0) {
        subscribedTransactions.set(key, 1);
      } else {
        subscribedTransactions.set(key, amount + 1);
      }
      return () => {
        const currentAmount = subscribedTransactions.get(key);
        if ((currentAmount ?? 0) > 1) {
          subscribedTransactions.set(key, (currentAmount ?? 0) - 1);
        } else {
          subscribedTransactions.delete(key);
        }
        return Promise.resolve();
      };
    },
    [subscribedTransactions]
  );

  const refetchAllSubscriptions = useCallback(async () => {
    const keysToFetch = [...subscribedTransactions.keys()];
    await refetchMany(keysToFetch);
  }, [refetchMany, subscribedTransactions]);

  useEffect(() => {
    const interval = setInterval(() => {
      void refetchAllSubscriptions().catch((e) => {
        onError(new SailRefetchSubscriptionsError(e));
      });
    }, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [onError, refetchAllSubscriptions, refreshIntervalMs]);

  const getDatum = useCallback(
    (k: string | null | undefined): TransactionDatum => {
      if (k) {
        const transactionInfo = getCached(k);
        if (transactionInfo) {
          return {
            transactionId: k,
            transactionInfo,
          };
        }
        if (transactionInfo === null) {
          // Cache hit but null entry in cache
          return null;
        }
      }
      return undefined; // k === undefined ? undefined : null
    },
    [getCached]
  );

  return {
    loader: transactionLoader,
    transactionsCache,
    emitter,

    getCached,
    getDatum,
    refetch,
    refetchMany,
    refetchAllSubscriptions,
    onCache,
    fetchKeys,
    subscribe,

    batchDurationMs,
    refreshIntervalMs,
  };
};
