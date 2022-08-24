import { matchPath } from 'react-router';

import type { History, Location, LocationState, Path, UnregisterCallback } from 'history';
import { makeObservable, observable, runInAction } from 'mobx';
import { singleton } from 'tsyringe';

@singleton()
export class LocationService {
  _location?: Location;

  private _history?: History;
  private _removeListener?: UnregisterCallback;

  constructor() {
    makeObservable(this, {
      _location: observable,
    });
  }

  _listenHistory(): void {
    this._removeListener && this._removeListener();

    this._removeListener = this._history?.listen((location) => {
      runInAction(() => (this._location = location));
    });
  }

  setHistory(history: History): void {
    this._history = history;

    this._listenHistory();
  }

  getParams<Params>(pathTemplate: string): Params {
    const match = matchPath<Params>(this._location?.pathname || '', { path: pathTemplate });

    if (!match) {
      return {} as Params;
    }

    return match.params;
  }

  push(pathname: Path, props: LocationState): void {
    this._history?.push(pathname, props);
  }
}
