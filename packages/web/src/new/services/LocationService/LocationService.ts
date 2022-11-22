import { matchPath } from 'react-router';

import type { History, Location, LocationState, Path, UnregisterCallback } from 'history';
import { action, makeObservable, observable } from 'mobx';
import assert from 'ts-invariant';
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

  private _assertHistory(): void {
    assert(this._history, 'History is not set in LocationService');
  }

  private _assertLocation(): void {
    assert(this._location, 'Location is not set in LocationService');
  }

  private _listenHistory(): void {
    if (this._removeListener) {
      this._removeListener();
    }

    this._assertHistory();
    this._removeListener = this._history!.listen(
      action((location) => {
        this._location = location;
      }),
    );
  }

  setHistory(history: History): void {
    this._history = history;

    this._listenHistory();
  }

  getParams<Params>(pathTemplate: string): Params {
    this._assertLocation();
    const match = matchPath<Params>(this._location!.pathname || '', { path: pathTemplate });

    if (!match) {
      return {} as Params;
    }

    return match.params;
  }

  push(pathname: string | Path, props?: LocationState): void {
    this._assertHistory();
    this._history!.push(pathname, props ?? { fromPage: this._location?.pathname });
  }

  replace(pathname: string | Path, props?: LocationState): void {
    this._assertHistory();
    this._assertLocation();
    this._history!.replace(pathname, props ?? this._location?.state);
  }

  reload(): void {
    this._assertHistory();
    this._history!.go(0);
  }
}
