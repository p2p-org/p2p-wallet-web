import { computed, makeObservable } from 'mobx';
import { lazyObservable } from 'mobx-utils';
import type { ILazyObservable } from 'mobx-utils/lib/lazy-observable';
import { uniq } from 'ramda';
import { Lifecycle, scoped } from 'tsyringe';

import { Defaults } from 'new/services/Defaults';
import type { CurrentPrice } from 'new/services/PriceAPIs/PricesService/PricesFetcher';

import { CoingeckoPricesFetcher } from '../Coingecko';
import { PricesStorage } from './PricesStorage';

@scoped(Lifecycle.ContainerScoped)
export class PricesService {
  // Constants

  private _refreshInterval = 15 * 60 * 1000; // 15 minutes
  private _timer?: NodeJS.Timeout;

  // Properties
  private _watchList: Set<string> = new Set();
  private _currentPrices: ILazyObservable<{ [key in string]: CurrentPrice }>;

  constructor(private _storage: PricesStorage, private _fetcher: CoingeckoPricesFetcher) {
    this._currentPrices = lazyObservable((sink) => {
      this._getCurrentPricesRequest().then((prices) => sink(prices));
    }, this._storage.retrivePrices());

    this._currentPrices.refresh();

    makeObservable(this, {
      currentPrices: computed,
    });
  }

  // Helpers

  private _getCurrentPricesRequest(
    tokens: string[] | null = null,
  ): Promise<{ [key in string]: CurrentPrice }> {
    let coins = tokens ?? Array.from(this._watchList);
    coins = uniq(coins); // .filter((token) => !token.includes('-') && !token.includes('/'));

    if (coins.length === 0) {
      return Promise.resolve({});
    }

    return this._fetcher
      .getCurrentPrices({ coins, toFiat: Defaults.fiat.code.toLowerCase() })
      .then((newPrices) => {
        // TODO: refactor, because it makes second request
        const prices = this._currentPrices.current() ?? {};

        for (const [key, value] of Object.entries(newPrices)) {
          if (value) {
            prices[key] = value;
          }
        }

        return prices;
      })
      .then((newPrices) => {
        this._storage.savePrices(newPrices);

        return newPrices;
      });
  }

  //

  get currentPrices(): ILazyObservable<{ [p: string]: CurrentPrice }> {
    return this._currentPrices;
  }

  getWatchList(): Set<string> {
    return this._watchList;
  }

  currentPrice(coinName: string): CurrentPrice | null {
    return this._currentPrices.current()[coinName] ?? null;
  }

  addToWatchList(tokens: string[]): void {
    for (const token of tokens) {
      this._watchList.add(token);
    }
  }

  fetchPrices(tokens: string[]): void {
    if (!tokens.length) {
      return;
    }

    // TODO: check that is needed
    // this._currentPrices = lazyObservable((sink) => {
    //   this._getCurrentPricesRequest(tokens).then((prices) => sink(prices));
    // }, this._storage.retrivePrices());

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
