import { autorun, makeObservable, observable, set, toJS } from 'mobx';

import { Fiat } from 'new/app/models/Fiat';
import { APIEndpoint } from 'new/app/sdk/SolanaSDK';

function makeLocalStorage<T>(_this: { fromJSON(json: T): T }, name: string) {
  const storedJson = localStorage.getItem(name);
  if (storedJson) {
    const json = JSON.parse(storedJson);
    set(_this, _this.fromJSON(json));
  }
  autorun(() => {
    const value = toJS(_this);
    localStorage.setItem(name, JSON.stringify(value));
  });
}

interface DefaultsKeys {
  apiEndPoint: APIEndpoint;

  walletName: { [pubkey in string]: string };

  hiddenWalletPubkey: string[];
  unhiddenWalletPubkey: string[];
  hideZeroBalances: boolean;

  fiat: Fiat;
}

console.log(1111, APIEndpoint.defaultEndpoints);

class _Defaults implements DefaultsKeys {
  apiEndPoint: APIEndpoint = APIEndpoint.defaultEndpoints[0]!;

  walletName: { [pubkey in string]: string } = {};

  hiddenWalletPubkey: string[] = [];
  unhiddenWalletPubkey: string[] = [];
  hideZeroBalances = true;

  fiat: Fiat = Fiat.rub;

  constructor() {
    makeObservable(this, {
      apiEndPoint: observable,

      walletName: observable,

      hiddenWalletPubkey: observable,
      unhiddenWalletPubkey: observable,
      hideZeroBalances: observable,

      fiat: observable,
    });
    makeLocalStorage(this, 'defaults');
  }

  fromJSON(json: DefaultsKeys): DefaultsKeys {
    return {
      ...json,
      apiEndPoint: json.apiEndPoint ? new APIEndpoint(json.apiEndPoint) : this.apiEndPoint,
      fiat: new Fiat(json.fiat?.type ?? this.fiat),
    };
  }
}

export const Defaults = new _Defaults();
