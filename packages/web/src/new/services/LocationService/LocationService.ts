import isEqual from 'react-fast-compare';
import type { Location, NavigateFunction, Params, Path } from 'react-router-dom';
import { matchPath } from 'react-router-dom';

import { action, makeObservable, observable } from 'mobx';
import assert from 'ts-invariant';
import { singleton } from 'tsyringe';

@singleton()
export class LocationService {
  private _location?: Location;
  private _navigate?: NavigateFunction;

  constructor() {
    makeObservable<LocationService, '_location'>(this, {
      _location: observable,

      setLocation: action,
    });
  }

  private _assertNavigate(): void {
    assert(this._navigate, 'NavigateFunction is not set in LocationService');
  }

  private _assertLocation(): void {
    assert(this._location, 'Location is not set in LocationService');
  }

  setLocation(location: Location): void {
    if (!isEqual(this._location, location)) {
      this._location = location;
    }
  }

  setNavigate(navigate: NavigateFunction): void {
    this._navigate = navigate;
  }

  getParams<ParamKey extends string>(pathTemplate: string): Params<ParamKey> {
    this._assertLocation();

    const match = matchPath<ParamKey, string>(
      { path: pathTemplate },
      this._location!.pathname || '',
    );

    if (!match) {
      return {} as Params<ParamKey>;
    }

    return match.params;
  }

  push(pathname: Path | string, props?: Record<string, unknown>): void {
    this._assertNavigate();
    this._navigate!(pathname, { state: props ?? { fromPage: this._location?.pathname } });
  }

  replace(pathname: Path | string, props?: Record<string, unknown>): void {
    this._assertNavigate();
    this._assertLocation();
    this._navigate!(pathname, { state: props || this._location!.state, replace: true });
  }

  reload(): void {
    this._assertNavigate();
    this._navigate!(0);
  }
}
