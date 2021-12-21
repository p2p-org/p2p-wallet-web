type CacheOpts = {
  ttl: number;
};

type CacheItem<T> = {
  timestamp: number;
  cachedResult: T;
};

export class CacheTTL<T> {
  private readonly _opts?: CacheOpts;

  private readonly _caches = new Map<string, CacheItem<T>>();

  constructor(opts?: CacheOpts) {
    this._opts = opts;
  }

  set(key: string, item: T) {
    this._caches.set(key, { timestamp: Date.now(), cachedResult: item });
  }

  get(key: string): T | null {
    const now = Date.now();
    const { timestamp, cachedResult } = this._caches.get(key) || {};

    if (timestamp && cachedResult) {
      // cache hit
      if (!this._opts?.ttl || now - timestamp < this._opts.ttl) {
        // not expired
        return cachedResult;
      }
    }

    return null;
  }

  toArray() {
    return Array.from(this._caches.values()).map((item) => item.cachedResult);
  }
}
