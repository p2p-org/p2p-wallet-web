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
