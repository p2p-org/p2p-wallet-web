/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useReducer, useRef } from 'react';

import { useIntervalHook } from 'utils/hooks/useIntervalHook';

export type AsyncResult<T> = AsyncPending | AsyncSuccess<T> | AsyncFailure;

type AsyncPending = {
  value: null;
  error: null;
};

// TODO: Add an explicit state for pending requests
export type AsyncSuccess<T> = {
  value: T;
  error: null;
};

type AsyncFailure = {
  value: null;
  error: Error;
};

export const defaultAsyncPending: AsyncPending = {
  value: null,
  error: null,
};

export function createAsyncSuccess<T>(result: T): AsyncSuccess<T> {
  return { value: result, error: null };
}

export const LONG_MAX_AGE = 120_000;
export const DEFAULT_MAX_AGE = 30_000;
export const SHORTENED_MAX_AGE = 10_000;

export function isAsyncPending<T>(result: AsyncResult<T>): result is AsyncPending {
  return result.value === null && result.error === null;
}

export function isAsyncSuccess<T>(result: AsyncResult<T>): result is AsyncSuccess<T> {
  return result.value !== null && result.error === null;
}

export function isAsyncFailure<T>(result: AsyncResult<T>): result is AsyncFailure {
  return result.value === null && result.error !== null;
}

type BatchedResult<T> = AsyncResult<{ [key: string]: T }>;

type CacheValue<T> = {
  asyncFn: () => Promise<T>;
  result: AsyncResult<T>;
  lastUpdate: number;
  renderQueue: React.DispatchWithoutAction[];
};

export function getMaxAge(isRefreshRateIncreased: boolean) {
  return isRefreshRateIncreased ? SHORTENED_MAX_AGE : DEFAULT_MAX_AGE;
}

export default class AsyncCache<T> {
  private _cache: Map<string, CacheValue<T>> = new Map();

  useAsync(
    cacheKey: string,
    asyncFn: () => Promise<T>,
    maxAge: number = DEFAULT_MAX_AGE,
    poll = true,
  ): AsyncResult<T> {
    const [, renderFn] = useReducer((i) => i + 1, 0);
    const cache = this._save(cacheKey, asyncFn);

    useEffect(() => {
      this._queueRenderFn(cache, renderFn);

      return () => this._removeRenderFn(cache, renderFn);
    }, [cache, renderFn]);

    // Invoke `_refreshStaleCache` on every function call.
    // `_refreshStaleCache` must be called inside the hook
    // to ensure it is invoked after `_queueRenderFn`.
    useEffect(() => {
      this._refreshStaleCache(cache, maxAge);
    });

    useIntervalHook(
      () => {
        this._refreshStaleCache(cache, maxAge);
      },
      poll ? maxAge : null,
    );

    return cache.result;
  }

  useBatchedAsync(
    keyPairs: [string, () => Promise<T>][],
    maxAge: number = DEFAULT_MAX_AGE,
    poll = true,
  ): BatchedResult<T> {
    const [, renderFn] = useReducer((i) => i + 1, 0);

    const caches = keyPairs.map(([cacheKey, asyncFn]) => this._save(cacheKey, asyncFn));

    const resultRef = useRef<AsyncResult<{ [key: string]: T }>>({
      value: null,
      error: null,
    });

    const aggregateKey = keyPairs
      .map(([cacheKey, _]) => cacheKey)
      .sort()
      .join(',');

    useEffect(() => {
      caches.forEach((cache) => this._queueRenderFn(cache, renderFn));

      return () => caches.forEach((cache) => this._removeRenderFn(cache, renderFn));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [aggregateKey]);

    useIntervalHook(
      () => {
        caches.forEach((cache) => this._refreshStaleCache(cache, maxAge));
      },
      poll ? maxAge : null,
    );

    caches.forEach((cache) => this._refreshStaleCache(cache, maxAge));

    const resultPairs: [string, AsyncResult<T>][] = keyPairs.map(([cacheKey, _], index) => [
      cacheKey,
      caches[index].result,
    ]);

    const newResult = aggregateAsyncResults(resultPairs);

    if (!isBatchedResultsEqual(newResult, resultRef.current)) {
      resultRef.current = newResult;
    }

    return resultRef.current;
  }

  getLastUpdate(cacheKey: string): number | undefined {
    return this._cache.get(cacheKey)?.lastUpdate;
  }

  getResult(cacheKey: string): AsyncResult<T> | undefined {
    return this._cache.get(cacheKey)?.result;
  }

  refreshCache(cacheKey: string): Promise<T> | undefined {
    const cache = this._cache.get(cacheKey);
    if (!cache) {
      return undefined;
    }

    return this._refreshCache(cache);
  }

  async _refreshStaleCache(cache: CacheValue<T>, maxAge: number) {
    const now = new Date().getTime();
    if (now > cache.lastUpdate + maxAge) {
      this._refreshCache(cache).catch((e) => {
        console.error('async error: ', e);
      });
    }
  }

  async _refreshCache(cache: CacheValue<T>): Promise<T> {
    cache.lastUpdate = new Date().getTime();

    let result, promise;
    try {
      promise = cache.asyncFn();
      result = { value: await promise, error: null };
      cache.result = result;
      cache.renderQueue.forEach((rerender) => rerender());
    } catch (e) {
      if (cache.result.value) {
        promise = Promise.resolve(cache.result.value);
      } else {
        promise = Promise.reject(e.message);
        result = { value: null, error: new Error(e.message) };
        cache.result = result;
        cache.renderQueue.forEach((rerender) => rerender());
      }
    }

    return promise;
  }

  _save(cacheKey: string, asyncFn: () => Promise<T>): CacheValue<T> {
    let cache = this._cache.get(cacheKey);

    if (!cache) {
      cache = {
        asyncFn,
        result: { value: null, error: null },
        lastUpdate: 0,
        renderQueue: [],
      };

      this._cache.set(cacheKey, cache);
    } else {
      cache.asyncFn = asyncFn;
    }

    return cache;
  }

  _queueRenderFn(cache: CacheValue<T>, renderFn: React.DispatchWithoutAction) {
    cache.renderQueue.push(renderFn);
  }

  _removeRenderFn(cache: CacheValue<T>, renderFn: React.DispatchWithoutAction) {
    const index = cache.renderQueue.indexOf(renderFn);
    if (index === -1) {
      throw new Error('Unable to find render function');
    }

    cache.renderQueue.splice(index, 1);
  }
}

function aggregateAsyncResults<T>(
  keyPairs: [string, AsyncResult<T>][],
): AsyncResult<{ [key: string]: T }> {
  const asyncResults = keyPairs.map(([_, result]) => result);
  const error = asyncResults.find((result) => result.error)?.error;
  if (error) {
    return { value: null, error };
  }

  const nullValue = asyncResults.find((result) => !result.value);
  if (nullValue) {
    return { value: null, error: null };
  }

  return {
    value: Object.fromEntries(
      keyPairs
        .map(([cacheKey, result]) => [cacheKey, result.value])
        .filter(([_, result]) => result),
    ),
    error: null,
  };
}

function isBatchedResultsEqual<T>(r1: BatchedResult<T>, r2: BatchedResult<T>): boolean {
  if (isAsyncSuccess(r1) && isAsyncSuccess(r2)) {
    return equalAggregatedResults(r1.value, r2.value);
  } else if (isAsyncFailure(r1) && isAsyncFailure(r2)) {
    return r1.error === r2.error;
  }

  return isAsyncPending(r1) && isAsyncPending(r2);
}

function equalAggregatedResults<T>(r1: { [key: string]: T }, r2: { [key: string]: T }): boolean {
  return (
    Object.keys(r1).length === Object.keys(r2).length &&
    Object.entries(r1).every(([key, item]: [string, T]) => r2[key] === item)
  );
}
