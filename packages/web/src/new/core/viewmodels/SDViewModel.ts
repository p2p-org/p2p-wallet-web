import { action, computed, flow, makeObservable, observable } from 'mobx';
import type { CancellablePromise } from 'mobx/dist/api/flow';

import { ViewModel } from './ViewModel';

export enum SDFetcherState {
  initializing = 'initializing',
  loading = 'loading',
  loaded = 'loaded',
  error = 'error',
}

export abstract class SDViewModel<T> extends ViewModel {
  readonly initialData: T;
  requestDisposable?: CancellablePromise<T>;

  data: T;
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

      flush: action,
      reload: action,
      cancelRequest: action,
      // createRequest: flow,
      isFetchable: computed,
      request: action,
      handleNewData: action,
      handleError: action,
      dataObservable: computed,
    });
  }

  // Actions

  flush(): void {
    this.data = this.initialData;
  }

  reload(): void {
    this.flush();
    this.request(true);
  }

  cancelRequest(): void {
    this.requestDisposable?.cancel();
  }

  // Asynchronous request handler
  createRequest = flow<T, []>(function* (this: SDViewModel<T>): Generator<Promise<T>> {
    // delay for simulating loading, MUST OVERRIDE
    return yield Promise.resolve<T>(this.data);
  });

  get isFetchable(): boolean {
    return this.state !== SDFetcherState.loading;
  }

  request(reload = false): void {
    if (reload) {
      this.cancelRequest();
    } else if (!this.isFetchable) {
      // there is an running operation
      return;
    }
    this.state = SDFetcherState.loading;
    this.requestDisposable = this.createRequest();
    this.requestDisposable
      .then((newData) => {
        this.handleNewData(newData);
      })
      .catch((error) => {
        this.handleError(error);
      });
  }

  handleNewData(newData: T): void {
    this.data = newData;
    this.error = null;
    this.state = SDFetcherState.loaded;
  }

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
}
