type CacheOpts = {
  ttl: number;
};

type CacheItem<T> = {
  timestamp: number;
  cachedResult: T;
};

export class CacheTTL<T> {
  private readonly opts: CacheOpts;

  private readonly caches = new Map<string, CacheItem<T>>();

  constructor({ ttl = 5000 }: CacheOpts) {
    this.opts = {
      ttl,
    };
  }

  set(key: string, item: T) {
    this.caches.set(key, { timestamp: Date.now(), cachedResult: item });
  }

  get(key: string): T | null {
    const now = Date.now();
    const { timestamp, cachedResult } = this.caches.get(key) || {};

    if (timestamp && cachedResult) {
      // cache hit
      if (now - timestamp < this.opts.ttl) {
        // not expired
        return cachedResult;
      }
    }

    return null;
  }
}
