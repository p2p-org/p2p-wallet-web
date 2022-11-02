/// The interface describes a cache storage
interface Caching<T> {
  /// Read element from cache
  read(key: string): T | undefined;

  /// Write element from cache
  write(key: string, data: T): void;

  /// Clear all data in cache
  clear(): void;
}

/// Simple cache storage
class InMemoryCache<T> implements Caching<T> {
  private readonly _maxSize: number;

  storage: Map<string, T> = new Map();

  constructor(maxSize: number) {
    this._maxSize = maxSize;
  }

  read(key: string): T | undefined {
    if (!this.storage.has(key)) {
      return undefined;
    }

    const val = this.storage.get(key)!;
    this.storage.delete(key);
    this.storage.set(key, val);
    return val;
  }

  write(key: string, data: T): void {
    this.storage.delete(key);

    if (this.storage.size === this._maxSize) {
      this.storage.delete(this.storage.keys().next().value);
    }
    this.storage.set(key, data);
  }

  clear(): void {
    this.storage = new Map();
  }
}
