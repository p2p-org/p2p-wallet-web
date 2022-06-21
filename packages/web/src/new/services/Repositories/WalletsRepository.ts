import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';
import { action, computed, flow, makeObservable, observable, reaction } from 'mobx';
import { Lifecycle, scoped } from 'tsyringe';

import { SDListViewModel } from 'new/core/viewmodels/SDListViewModel';
import { SDFetcherState } from 'new/core/viewmodels/SDViewModel';
import { LogEvent, Logger, Wallet } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import { PricesService } from 'new/services/PriceAPIs/PricesService';
import type { AccountsObservableEvent } from 'new/services/Socket';
import { AccountObservableService } from 'new/services/Socket';
import { SolanaService } from 'new/services/SolanaService';

@scoped(Lifecycle.ContainerScoped)
export class WalletsRepository extends SDListViewModel<Wallet> {
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
      nativeWallet: computed,
      isHiddenWalletsShown: observable,
      createRequest: flow,
      toggleIsHiddenWalletShown: action.bound,
      toggleWalletVisibility: action.bound,
    });
  }

  protected onInitialize(): void {
    this._bind();
    this._startObserving();
  }

  protected override afterReactionsRemoved() {
    // TODO: check it works
    this._stopObserving();
  }

  // Binding
  private _bind(): void {
    // observe prices
    this.addReaction(
      reaction(
        () => this._pricesService.currentPrices.pending,
        () => {
          this._updatePrices();
        },
      ),
    );

    // observe hideZeroBalances settings
    this.addReaction(
      reaction(
        () => Defaults.hideZeroBalances,
        () => {
          this._updateWalletsVisibility();
        },
      ),
    );

    // observe tokens' balance
    // observe account notification
    this.addReaction(
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
      ),
    );
  }

  // Observing

  private _startObserving(): void {
    this._timer = setTimeout(async () => {
      try {
        await this._getNewWallets();
      } finally {
        this._startObserving();
      }
    }, 10000);
  }

  private _stopObserving(): void {
    clearInterval(this._timer);
  }

  // Methods

  override createRequest = flow(function* (this: WalletsRepository) {
    return yield Promise.all([
      this._solanaService.provider.connection.getBalance(
        this._solanaService.provider.wallet.publicKey,
        'recent',
      ),
      this._solanaService.getTokenWallets(this._solanaService.provider.wallet.publicKey.toString()),
    ])
      .then(([balance, wallets]) => {
        let walletsNew = wallets;

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

        return wallets;
      });
  });

  private _getNewWallets(): Promise<void> {
    return this._solanaService
      .getTokenWallets(this._solanaService.provider.wallet.publicKey.toString())
      .then((newData) => {
        let data = [...this.data];
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
        this.overrideData(data);
      });
  }

  // getters

  get hiddenWallets(): Wallet[] {
    return this.data.filter((wallet) => wallet.isHidden);
  }

  // Actions

  toggleIsHiddenWalletShown(): void {
    this.isHiddenWalletsShown = !this.isHiddenWalletsShown;
  }

  toggleWalletVisibility(wallet: Wallet): void {
    if (wallet.isHidden) {
      this._unhideWallet(wallet);
    } else {
      this._hideWallet(wallet);
    }
  }

  // Mappers

  private _mapPrices(wallets: Wallet[]): Wallet[] {
    const walletsNew = wallets;
    for (const wallet of walletsNew) {
      if (!wallet.token.extensions?.coingeckoId) {
        continue;
      }

      wallet.price = this._pricesService.currentPrice(wallet.token.extensions.coingeckoId);
    }

    return walletsNew;
  }

  private _mapVisibility(wallets: Wallet[]): Wallet[] {
    const walletsNew = wallets;
    walletsNew.forEach((wallet) => {
      // update visibility
      wallet.updateVisibility();
    });
    return walletsNew;
  }

  // Helpers

  private _updatePrices(): void {
    if (this.state !== SDFetcherState.loaded) {
      return;
    }

    let wallets = this._mapPrices(this.data);
    wallets = wallets.sort(Wallet.defaultSorter);
    this.overrideData(wallets);
  }

  private _updateWalletsVisibility(): void {
    // TODO: check current state loaded
    if (this.state !== SDFetcherState.loaded) {
      return;
    }

    const wallets = this._mapVisibility(this.data);
    this.overrideData(wallets);
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
    this.updateItem(
      (item) => item.pubkey === wallet.pubkey,
      (item) => {
        // TODO: check new reference
        item.updateVisibility();
        return item;
      },
    );
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
    this.updateItem(
      (item) => item.pubkey === notification.pubkey,
      (item) => {
        // TODO: check new reference
        item.lamports = notification.lamports;
        return item;
      },
    );
  }
}
