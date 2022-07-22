import { autorun, makeObservable, observable, set, toJS } from 'mobx';

import { Fiat } from 'new/app/models/Fiat';
import { SolanaSDKPublicKey } from 'new/sdk/SolanaSDK';
import type { CurrentPrice } from 'new/services/PriceAPIs/PricesService';

import { APIEndpoint } from '../sdk/SolanaSDK/models/APIEndpoint';

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
  apiEndpoint: APIEndpoint;

  walletName: { [pubkey in string]: string };

  hiddenWalletPubkey: string[];
  unhiddenWalletPubkey: string[];
  hideZeroBalances: boolean;

  fiat: Fiat;
  prices: { [key in string]: CurrentPrice };
  payingTokenMint: string;
}

class _Defaults implements DefaultsKeys {
  apiEndpoint: APIEndpoint = APIEndpoint.defaultEndpoints[0]!;

  walletName: { [pubkey in string]: string } = {};

  hiddenWalletPubkey: string[] = [];
  unhiddenWalletPubkey: string[] = [];
  hideZeroBalances = true;

  fiat: Fiat = Fiat.rub;
  prices: { [key in string]: CurrentPrice } = {};
  payingTokenMint: string = SolanaSDKPublicKey.wrappedSOLMint.toString();

  constructor() {
    makeObservable(this, {
      apiEndpoint: observable,

      walletName: observable,

      hiddenWalletPubkey: observable,
      unhiddenWalletPubkey: observable,
      hideZeroBalances: observable,

      fiat: observable,
      prices: observable,
      payingTokenMint: observable,
    });
    makeLocalStorage(this, 'defaults');
  }

  fromJSON(json: DefaultsKeys): DefaultsKeys {
    return {
      ...json,
      apiEndpoint: json.apiEndpoint ? new APIEndpoint(json.apiEndpoint) : this.apiEndpoint,
      fiat: new Fiat(json.fiat?.type ?? this.fiat),
    };
  }
}

export const Defaults = new _Defaults();
