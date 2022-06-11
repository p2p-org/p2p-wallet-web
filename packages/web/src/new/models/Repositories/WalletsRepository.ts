import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';
import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';
import { Lifecycle, scoped } from 'tsyringe';

import { LogEvent, Logger, Wallet } from 'new/app/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import { PricesService } from 'new/services/PriceAPIs/PricesService';
import type { AccountsObservableEvent } from 'new/services/Socket';
import { AccountObservableService } from 'new/services/Socket';
import { SolanaService } from 'new/services/SolanaService';

import { Model } from '../Model';

@scoped(Lifecycle.ContainerScoped)
export class WalletsRepository extends Model {
  isInitialized = false;
  data: Wallet[] = [];

  // Properties

  private _timer?: NodeJS.Timeout;

  // Getters

  get nativeWallet(): Wallet | null {
    return this.data.find((wallet) => wallet.isNativeSOL) ?? null;
  }

  getWallets(): Wallet[] {
    return this.data;
  }

  // Subjects

  isHiddenWalletsShown = false;

  // Initializer

  constructor(
    private _solanaService: SolanaService,
    private _pricesService: PricesService,
    private _socket: AccountObservableService,
  ) {
    super();
    makeObservable(this, {
      isInitialized: observable,
      data: observable,
      nativeWallet: computed,
      isHiddenWalletsShown: observable,
      toggleIsHiddenWalletShown: action,
    });
  }

  protected onInitialize(): void {
    this._bind();
    this._startObserving();
  }

  protected override afterReactionsRemoved() {
    this._stopObserving();
  }

  // Binding
  private _bind(): void {
    this.isInitialized = false;
    this._createRequest().then(() => {
      runInAction(() => (this.isInitialized = true));
    });

    // observe prices
    reaction(
      () => this._pricesService.currentPrices().pending,
      () => {
        this._updatePrices();
      },
    );

    // observe hideZeroBalances settings
    reaction(
      () => Defaults.hideZeroBalances,
      () => {
        this._updateWalletsVisibility();
      },
    );

    // observe tokens' balance
    // observe account notification
    reaction(
      () => this.getWallets(),
      (wallets) => {
        for (const wallet of wallets) {
          this._socket.subscribeAccountNotification(
            wallet.pubkey,
            this._handleAccountNotification.bind(this),
          );
        }
      },
    );
  }

  // Observing

  private _startObserving(): void {
    this._timer = setTimeout(async () => {
      try {
        await this._getNewWallet();
      } finally {
        this._startObserving();
      }
    }, 10000);
  }

  private _stopObserving(): void {
    clearInterval(this._timer);
  }

  // Methods

  private _createRequest(): Promise<void> {
    return Promise.all([
      this._solanaService.provider.connection.getBalance(
        this._solanaService.provider.wallet.publicKey,
        'recent',
      ),
      this._solanaService.getTokenWallets(this._solanaService.provider.wallet.publicKey.toString()),
    ])
      .then(([balance, wallets]) => {
        let walletsNew = [...wallets];

        const solWallet = Wallet.nativeSolana({
          pubkey: this._solanaService.provider.wallet.publicKey.toString(),
          lamports: new u64(balance),
        });
        walletsNew.unshift(solWallet);

        // update visibility
        walletsNew = this._mapVisibility(walletsNew);

        // map prices
        walletsNew = this._mapPrices(walletsNew);

        // sort
        walletsNew = walletsNew.sort(Wallet.defaultSorter);

        return walletsNew;
      })
      .then((wallets) => {
        const newTokens = wallets
          .map((wallet) => wallet.token.extensions?.coingeckoId)
          .filter(
            (coingeckoId) => coingeckoId && !this._pricesService.getWatchList().has(coingeckoId),
          ) as string[];

        this._pricesService.addToWatchList(newTokens);
        this._pricesService.fetchPrices(newTokens);

        runInAction(() => {
          this.data = wallets;
        });
      });
  }

  private _getNewWallet(): Promise<void> {
    return this._solanaService
      .getTokenWallets(this._solanaService.provider.wallet.publicKey.toString())
      .then((newData) => {
        let data = this.data;
        let newWallets = newData
          .filter((w1) => !data.some((wallet) => wallet.pubkey === w1.pubkey))
          .filter((w1) => !w1.lamports?.eq(ZERO));

        newWallets = this._mapPrices(newWallets);
        newWallets = this._mapVisibility(newWallets);
        data.push(...newWallets);
        data = data.sort(Wallet.defaultSorter);
        return data;
      })
      .then((data) => {
        runInAction(() => {
          this.data = data;
        });
      });
  }

  // Actions

  toggleIsHiddenWalletShown(): void {
    this.isHiddenWalletsShown = !this.isHiddenWalletsShown;
  }

  toggleWalletVisibility(wallet: Wallet): void {
    console.log(1111111, wallet.isHidden);
    if (wallet.isHidden) {
      this._unhideWallet(wallet);
    } else {
      this._hideWallet(wallet);
    }
  }

  // Mappers

  private _mapPrices(wallets: Wallet[]): Wallet[] {
    const walletsNew = [...wallets];

    for (const wallet of wallets) {
      if (!wallet.token.extensions?.coingeckoId) {
        continue;
      }

      wallet.price = this._pricesService.currentPrice(wallet.token.extensions.coingeckoId);
    }

    return walletsNew;
  }

  private _mapVisibility(wallets: Wallet[]): Wallet[] {
    const walletsNew = [...wallets];
    walletsNew.forEach((wallet) => {
      // update visibility
      wallet.updateVisibility();
    });
    return walletsNew;
  }

  // Helpers

  private _updatePrices(): void {
    // TODO: check current state loaded
    // if (data.pending) {
    //   return;
    // }

    runInAction(() => {
      let wallets = this._mapPrices(this.data);
      wallets = wallets.sort(Wallet.defaultSorter);
      this.data = wallets;
    });
  }

  private _updateWalletsVisibility(): void {
    // TODO: check current state loaded
    // if (data.pending) {
    //   return;
    // }

    runInAction(() => {
      const wallets = this._mapVisibility(this.data);
      this.data = wallets;
    });
  }

  private _hideWallet(wallet: Wallet): void {
    Defaults.unhiddenWalletPubkey = Defaults.unhiddenWalletPubkey.filter(
      (item) => item !== wallet.pubkey,
    );
    if (Defaults.hiddenWalletPubkey.indexOf(wallet.pubkey) === -1) {
      Defaults.hiddenWalletPubkey.push(wallet.pubkey);
    }
    this._updateVisibility(wallet);
  }

  private _unhideWallet(wallet: Wallet): void {
    if (Defaults.unhiddenWalletPubkey.indexOf(wallet.pubkey) === -1) {
      Defaults.unhiddenWalletPubkey.push(wallet.pubkey);
    }
    Defaults.hiddenWalletPubkey = Defaults.hiddenWalletPubkey.filter(
      (item) => item !== wallet.pubkey,
    );
    this._updateVisibility(wallet);
  }

  private _updateVisibility(wallet: Wallet): void {
    runInAction(() => {
      this.updateItem(
        (item) => item.pubkey === wallet.pubkey,
        (item) => {
          // TODO: check new reference
          item.updateVisibility();
          return item;
        },
      );
    });
  }

  // Account notifications

  private _handleAccountNotification(notification: AccountsObservableEvent): void {
    // notify changes
    const oldLamportsValue = this.data.find(
      (wallet) => wallet.pubkey === notification.pubkey,
    )?.lamports;
    const newLamportsValue = notification.lamports;

    if (oldLamportsValue) {
      let wlNoti;
      if (oldLamportsValue.gt(newLamportsValue)) {
        // sent
        // TODO: WLNotification
        Logger.log(
          JSON.stringify({
            account: notification.pubkey,
            lamports: oldLamportsValue.sub(newLamportsValue),
          }),
          LogEvent.info,
        );
      } else if (oldLamportsValue.lt(newLamportsValue)) {
        // received
        // TODO: WLNotification
        Logger.log(
          JSON.stringify({
            account: notification.pubkey,
            lamports: newLamportsValue.sub(oldLamportsValue),
          }),
          LogEvent.info,
        );
      }

      if (wlNoti) {
        // TODO: noti
      }
    }

    // update
    runInAction(() => {
      this.updateItem(
        (item) => item.pubkey === notification.pubkey,
        (item) => {
          // TODO: check new reference
          item.lamports = notification.lamports;
          return item;
        },
      );
    });
  }

  updateItem(predicate: (item: Wallet) => boolean, transform: (item: Wallet) => Wallet) {
    // modify items
    let itemsChanged = false;
    const index = this.data.findIndex(predicate);
    const item = transform(this.data[index]!);
    if (item !== this.data[index]) {
      itemsChanged = true;
      const data = this.data;
      data[index] = item;
      this.data = data;
    }

    return itemsChanged;
  }
}
