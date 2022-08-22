import { action, computed, makeObservable } from 'mobx';
import { uniq } from 'ramda';
import { singleton } from 'tsyringe';

import { LoadableRelay, LoadableState } from 'new/app/models/LoadableRelay';
import { Token } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import type { CurrentPrice } from 'new/services/PriceAPIs/PricesService/PricesFetcher';

import { CoingeckoPricesFetcher } from '../Coingecko';
import { PricesStorage } from './PricesStorage';

class PricesLoadableRelay extends LoadableRelay<{ [key in string]: CurrentPrice }> {
  override map(
    oldData: { [key in string]: CurrentPrice } | null,
    newData: { [key in string]: CurrentPrice },
  ): { [key in string]: CurrentPrice } {
    const data = oldData;
    if (!data) {
      return newData;
    }

    for (const key of Object.keys(newData)) {
      data[key] = newData[key]!;
    }
    return data;
  }
}

export interface PricesServiceType {
  // Observables
  currentPrices: LoadableRelay<{ [key in string]: CurrentPrice }>;

  // Getters
  getWatchList(): Set<Token>;
  currentPrice(coinName: string): CurrentPrice | null;

  // Actions
  clearCurrentPrices(): void;
  addToWatchList(tokens: Token[]): void;
  fetchPrices(tokens: Token[]): void;
  fetchAllTokensPriceInWatchList(): void;

  startObserving(): void;
  stopObserving(): void;
}

@singleton()
export class PricesService implements PricesServiceType {
  // Constants

  private _refreshInterval = 15 * 60 * 1000; // 15 minutes
  private _timer?: NodeJS.Timeout;

  // Properties
  private _watchList: Set<Token> = new Set([Token.renBTC, Token.nativeSolana, Token.usdc]);
  private readonly _currentPrices = new PricesLoadableRelay(Promise.resolve({}));

  constructor(private _storage: PricesStorage, private _fetcher: CoingeckoPricesFetcher) {
    // reload to get cached prices
    this._currentPrices.reload();

    // get current price
    const initialValue = this._storage.retrivePrices();
    this._currentPrices.accept(initialValue, LoadableState.loaded);

    // change request
    this._currentPrices.request = this._getCurrentPricesRequest();

    makeObservable(this, {
      currentPrices: computed,

      currentPrice: action,
      clearCurrentPrices: action,
      addToWatchList: action,
      fetchPrices: action,
      fetchAllTokensPriceInWatchList: action,
    });
  }

  // Helpers

  private async _getCurrentPricesRequest(
    tokens: Token[] | null = null,
  ): Promise<{ [key in string]: CurrentPrice }> {
    let coins = tokens ?? Array.from(this._watchList);
    coins = uniq(coins); // .filter((token) => !token.includes('-') && !token.includes('/'));

    if (coins.length === 0) {
      return Promise.resolve({});
    }

    const newPrices = await this._fetcher.getCurrentPrices({
      coins,
      fiat: Defaults.fiat.code,
    });
    // newPrices['renBTC'] = newPrices['BTC'] ?? null;
    const prices = this._currentPrices.value ?? {};
    for (const [key, value] of Object.entries(newPrices)) {
      if (value) {
        prices[key] = value;
      }
    }
    this._storage.savePrices(prices);
    return prices;
  }

  //

  get currentPrices(): LoadableRelay<{ [key in string]: CurrentPrice }> {
    return this._currentPrices;
  }

  getWatchList(): Set<Token> {
    return this._watchList;
  }

  currentPrice(coinName: string): CurrentPrice | null {
    return this._currentPrices.value?.[coinName] ?? null;
  }

  clearCurrentPrices(): void {
    this._currentPrices.flush();
    this._storage.savePrices({});
  }

  addToWatchList(tokens: Token[]): void {
    for (const token of tokens) {
      this._watchList.add(token);
    }
  }

  fetchPrices(tokens: Token[]): void {
    if (!tokens.length) {
      return;
    }

    this._currentPrices.request = this._getCurrentPricesRequest(tokens);
    this._currentPrices.refresh();
  }

  fetchAllTokensPriceInWatchList(): void {
    if (!this._watchList.size) {
      return;
    }

    this.fetchPrices(Array.from(this._watchList));
  }

  startObserving(): void {
    this.fetchAllTokensPriceInWatchList();
    // TODO: use timeout
    this._timer = setInterval(() => {
      this.fetchAllTokensPriceInWatchList();
    }, this._refreshInterval);
  }

  stopObserving(): void {
    clearInterval(this._timer);
  }
}
