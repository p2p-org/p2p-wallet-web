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

  walletName: Record<string, string>;

  appearance: Appearance;
  slippage: number;
  fiat: Fiat;
  hiddenWalletPubkey: string[];
  unhiddenWalletPubkey: string[];
  hideZeroBalances: boolean;
  prices: Record<string, CurrentPrice>;
  payingTokenMint: string;

  useFreeTransactions: boolean;
}

class _Defaults implements DefaultsKeys {
  apiEndpoint: APIEndpoint = APIEndpoint.defaultEndpoints[0]!;

  walletName: Record<string, string> = {};

  appearance: Appearance = Appearance.system;
  slippage = 0.01;
  fiat: Fiat = Fiat.usd;
  hiddenWalletPubkey: string[] = [];
  unhiddenWalletPubkey: string[] = [];
  hideZeroBalances = true;
  prices: Record<string, CurrentPrice> = {};
  payingTokenMint: string = SolanaSDKPublicKey.wrappedSOLMint.toString();

  useFreeTransactions = false;

  constructor() {
    makeObservable(this, {
      apiEndpoint: observable,

      walletName: observable,

      appearance: observable,
      slippage: observable,
      fiat: observable,
      hiddenWalletPubkey: observable,
      unhiddenWalletPubkey: observable,
      hideZeroBalances: observable,
      prices: observable,
      payingTokenMint: observable,

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
