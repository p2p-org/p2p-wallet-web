import { matchPath } from 'react-router';

import type { History, Location } from 'history';
import { action, makeObservable, observable, reaction } from 'mobx';
import { singleton } from 'tsyringe';

@singleton()
export class LocationService {
  _history?: History;
  _location?: Location;

  private _listenerRemover?: () => void;

  constructor() {
    makeObservable(this, {
      _history: observable,
      _location: observable,

      _setLocation: action,

      setHistory: action,
    });

    reaction(
      () => this._history,
      () => {
        // console.log('history changed -', history);

        if (this._listenerRemover) {
          this._listenerRemover();
        }

        const listenerRemoverFn = this._history!.listen((location) => {
          // console.log('location changed -', location);

          this._setLocation(location);
        });

        this._setListenerRemover(listenerRemoverFn);
      },
    );
  }

  _setLocation(location: Location) {
    this._location = location;
  }

  _setListenerRemover(listenerRemoverFn: () => void) {
    this._listenerRemover = listenerRemoverFn;
  }

  setHistory(history: History) {
    this._history = history;
  }

  getParams<Params>(pathTemplate: string) {
    const match = matchPath<Params>(this._location?.pathname || '', { path: pathTemplate });

    // console.log('recalc Match.Params -', match?.params);

    if (!match) {
      return {} as Params;
    }

    return match.params;
  }
}
