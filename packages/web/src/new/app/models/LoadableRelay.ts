import { action, flow, makeObservable, observable } from 'mobx';
import type { CancellablePromise } from 'mobx/dist/api/flow';

export enum LoadableStateType {
  notRequested = 'notRequested',
  loading = 'loading',
  loaded = 'loaded',
  error = 'error',
}

export class LoadableState {
  readonly type: LoadableStateType;
  readonly message: string | null;

  static get notRequested(): LoadableState {
    return new LoadableState(LoadableStateType.notRequested);
  }
  static get loading(): LoadableState {
    return new LoadableState(LoadableStateType.loading);
  }
  static get loaded(): LoadableState {
    return new LoadableState(LoadableStateType.loaded);
  }
  static error(message: string): LoadableState {
    return new LoadableState(LoadableStateType.error, message);
  }

  constructor(type: LoadableStateType, message: string | null = null) {
    this.type = type;
    this.message = message;
  }

  get isLoading(): boolean {
    return this.type === LoadableStateType.loading;
  }

  get isError(): boolean {
    if (this.type === LoadableStateType.error) {
      return true;
    }

    return false;
  }
}

export class LoadableRelay<T> {
  request: Promise<T>;
  value: T | null = null;
  state: LoadableState = new LoadableState(LoadableStateType.notRequested);

  disposable?: CancellablePromise<T>;

  constructor(request: Promise<T>) {
    this.request = request;

    makeObservable(this, {
      request: observable,
      state: observable,
      value: observable,

      flush: action,
      reload: action,
      createRequest: flow,
      refresh: action,
      accept: action,
    });
  }

  // Action

  // Flush result
  flush(): void {
    this.cancelRequest();
    this.value = null;
    this.state = LoadableState.notRequested;
  }

  // Flush result and refresh
  reload(): void {
    this.flush();
    this.refresh();
  }

  createRequest = flow<T, []>(function* (this: LoadableRelay<T>): Generator<Promise<T>> {
    return yield this.request;
  });

  // Reload request
  refresh(): void {
    // Cancel previous request
    this.cancelRequest();

    // Mark as loading
    this.state = LoadableState.loading;

    // Load request
    this.disposable = this.createRequest();
    this.disposable
      .then(
        action((data) => {
          this.value = this.map(this.value, data);
          this.state = LoadableState.loaded;
        }),
      )
      .catch(
        action((error) => {
          console.error(error);
          this.state = LoadableState.error(error);
        }),
      );
  }

  // Mapping
  map(_oldData: T | null, newData: T): T {
    return newData;
  }

  // Cancel current request
  cancelRequest(): void {
    this.disposable?.cancel();
  }

  // Override value by a given value and set state to loaded
  accept(value: T | null, state: LoadableState): void {
    this.cancelRequest();
    this.value = value;
    this.state = state;
  }
}
