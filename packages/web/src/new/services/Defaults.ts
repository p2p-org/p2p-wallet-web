import { autorun, makeObservable, observable, set, toJS } from 'mobx';

import { Fiat } from 'new/app/models/Fiat';
import { SolanaSDKPublicKey } from 'new/sdk/SolanaSDK';
import type { CurrentPrice } from 'new/services/PriceAPIs/PricesService';

import { APIEndpoint } from '../sdk/SolanaSDK/models/APIEndpoint';

export enum Appearance {
  system = 'system',
  light = 'light',
  dark = 'dark',
}

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

  appearance: Appearance;
  useFreeTransactions: boolean;
}

class _Defaults implements DefaultsKeys {
  apiEndpoint: APIEndpoint = APIEndpoint.defaultEndpoints[0]!;

  walletName: { [pubkey in string]: string } = {};

  hiddenWalletPubkey: string[] = [];
  unhiddenWalletPubkey: string[] = [];
  hideZeroBalances = true;

  fiat: Fiat = Fiat.usd;
  prices: { [key in string]: CurrentPrice } = {};
  payingTokenMint: string = SolanaSDKPublicKey.wrappedSOLMint.toString();

  appearance: Appearance = Appearance.system;
  useFreeTransactions = false;

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

      appearance: observable,
      useFreeTransactions: observable,
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
