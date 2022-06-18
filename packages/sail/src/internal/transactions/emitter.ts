import { EventEmitter as Emitter } from "eventemitter3";

export class CacheUpdateEvent {
  static type = "CacheUpdate";
  id: string;
  isNew: boolean;
  constructor(id: string, isNew: boolean) {
    this.id = id;
    this.isNew = isNew;
  }
}

export class CacheDeleteEvent {
  static type = "CacheUpdate";
  id: string;
  constructor(id: string) {
    this.id = id;
  }
}

export class CacheClearEvent {
  static type = "CacheDelete";
}

export class TransactionsEmitter {
  private readonly _emitter = new Emitter();

  onCache(callback: (args: CacheUpdateEvent) => void): () => void {
    this._emitter.on(CacheUpdateEvent.type, callback);

    return () => this._emitter.removeListener(CacheUpdateEvent.type, callback);
  }

  raiseCacheUpdated(id: string, isNew: boolean): void {
    this._emitter.emit(CacheUpdateEvent.type, new CacheUpdateEvent(id, isNew));
  }

  raiseCacheDeleted(id: string): void {
    this._emitter.emit(CacheDeleteEvent.type, new CacheDeleteEvent(id));
  }

  raiseCacheCleared(): void {
    this._emitter.emit(CacheClearEvent.type, new CacheClearEvent());
  }
}
