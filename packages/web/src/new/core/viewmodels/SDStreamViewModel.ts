import { action, computed, flow, makeObservable, observable } from 'mobx';
import type { CancellablePromise } from 'mobx/dist/api/flow';

import { SDFetcherState } from './SDViewModel';
import { ViewModel } from './ViewModel';

export abstract class SDStreamViewModel<T> extends ViewModel {
  // Properties

  readonly initialData: T;

  /// Current request
  requestDisposable?: CancellablePromise<T>;

  /// Current data
  data: T;

  /// Last occurred error
  error: Error | null = null;

  // Subject

  state: SDFetcherState;

  constructor({ initialData }: { initialData: T }) {
    super();
    this.initialData = initialData;
    this.data = initialData;
    this.state = SDFetcherState.initializing;

    makeObservable(this, {
      data: observable,
      error: observable,
      state: observable,

      clear: action,
      reload: action,
      cancelRequest: action,
      // createRequest: flow,
      isFetchable: action,
      fetch: action,
      handleData: action,
      handleError: action,
      dataObservable: computed,
    });
  }

  // Actions

  clear() {
    this.data = this.initialData;
    this.state = SDFetcherState.initializing;
  }

  reload() {
    this.clear();
    this.fetch(true);
  }

  cancelRequest(): void {
    this.requestDisposable?.cancel();
  }

  // Asynchronous request handler
  isFetchable(): boolean {
    return this.state !== SDFetcherState.loading;
  }

  /// Fetch next item
  next = flow<T, []>(function* (this: SDStreamViewModel<T>) {
    // delay for simulating loading, MUST OVERRIDE
    return yield Promise.resolve<T>(this.data);
  });

  fetch(force = false): void {
    if (force) {
      // cancel previous request
      this.cancelRequest();
    } else if (!this.isFetchable()) {
      // there is an running operation
      return;
    }

    this.state = SDFetcherState.loading;
    this.requestDisposable = this.next();
    this.requestDisposable
      .then((newData) => {
        this.handleData(newData);
      })
      .catch((error) => {
        this.handleError(error);
      })
      .finally(() => {
        this.state = SDFetcherState.loaded;
      });
  }

  /// processes incoming data
  handleData(newData: T): void {
    this.data = newData;
    this.error = null;
  }

  /// handles occurred error
  handleError(error: Error): void {
    this.error = error;
    this.state = SDFetcherState.error;
  }

  get dataObservable(): T | null {
    switch (this.state) {
      case SDFetcherState.loaded:
        return this.data;
      default:
        return null;
    }
  }

  get stateObservable(): SDFetcherState {
    return this.state;
  }
}
