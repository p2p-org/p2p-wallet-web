export class Cache<Key extends string, Value> {
  private _wrapped: Map<Key, Value> = new Map(); // TODO: should be persistent i think

  insert(value: Value, key: Key): void {
    this._wrapped.set(key, value);
  }

  value(key: Key): Value | undefined {
    return this._wrapped.get(key);
  }

  removeValue(key: Key): void {
    this._wrapped.delete(key);
  }
}
