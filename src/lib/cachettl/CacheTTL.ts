type CacheOpts = {
  ttl: number;
};

type CacheItem<T> = {
  timestamp: number;
  cachedResult: T;
};

export class CacheTTL<T> {
  private readonly opts?: CacheOpts;

  private readonly caches = new Map<string, CacheItem<T>>();

  constructor(opts?: CacheOpts) {
    this.opts = opts;
  }

  set(key: string, item: T) {
    this.caches.set(key, { timestamp: Date.now(), cachedResult: item });
  }

  get(key: string): T | null {
    const now = Date.now();
    const { timestamp, cachedResult } = this.caches.get(key) || {};

    if (timestamp && cachedResult) {
      // cache hit
      if (!this.opts?.ttl || now - timestamp < this.opts.ttl) {
        // not expired
        return cachedResult;
      }
    }

    return null;
  }

  toArray() {
    // eslint-disable-next-line unicorn/prefer-spread
    return Array.from(this.caches.values()).map((item) => item.cachedResult);
  }
}
