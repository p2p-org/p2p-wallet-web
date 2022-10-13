import { u64 } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { flow, reaction } from 'mobx';
import { injectable } from 'tsyringe';

import { SDListViewModel } from 'new/core/viewmodels/SDListViewModel';
import { SDFetcherState } from 'new/core/viewmodels/SDViewModel';
import type { GetWalletsConfig } from 'new/scenes/Main/Auth/typings';
import { derivePublicKeyFromSeed } from 'new/scenes/Main/Auth/utils';
import { Wallet } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import { PricesService } from 'new/services/PriceAPIs/PricesService';

@injectable()
export class WalletsListViewModel extends SDListViewModel<Wallet> {
  private _connection: Connection;
  private _requestConfig: GetWalletsConfig | null = null;
  private static _derivableAccountsNumber = 5;

  constructor(private _pricesService: PricesService) {
    super();

    this._connection = new Connection(Defaults.apiEndpoint.getURL());
  }

  protected override setDefaults() {}

  protected override onInitialize() {
    // observe prices
    this.addReaction(
      reaction(
        () => this._pricesService.currentPrices.state.type, // TODO: check
        () => {
          this._updatePrices();
        },
      ),
    );
  }

  protected override afterReactionsRemoved() {}

  private _updatePrices(): void {
    if (this.state !== SDFetcherState.loaded) {
      return;
    }

    let wallets = this._mapPrices(this.data);
    wallets = wallets.sort(Wallet.defaultSorter);
    this.overrideData(wallets);
  }

  private _mapPrices(wallets: Wallet[]): Wallet[] {
    const walletsNew = wallets;
    for (const wallet of walletsNew) {
      wallet.price = this._pricesService.currentPrice(wallet.token.symbol);
    }

    return walletsNew;
  }

  override createRequest = flow<Wallet[], []>(function* (
    this: WalletsListViewModel,
  ): Generator<Promise<Array<Wallet | null>>> {
    const { seed, derivationPathValue } = this._requestConfig as GetWalletsConfig;

    const derivableTokenAccountPublicKeys = new Array(WalletsListViewModel._derivableAccountsNumber)
      .fill(null)
      .map((_, idx) => {
        const pubKey = derivePublicKeyFromSeed(seed, idx, derivationPathValue);
        return new PublicKey(pubKey);
      });

    return yield this._connection
      .getMultipleAccountsInfo(derivableTokenAccountPublicKeys)
      .then((accounts) => {
        return accounts.map((acc, idx) => {
          if (acc) {
            return Wallet.nativeSolana({
              lamports: new u64(acc?.lamports),
              pubkey: derivableTokenAccountPublicKeys[idx]?.toString(),
            });
          }

          return Wallet.nativeSolana({
            lamports: new u64(0),
            pubkey: derivableTokenAccountPublicKeys[idx]?.toString(),
          });
        });
      })
      .then((wallets) => {
        const newTokens = wallets
          .map((wallet) => wallet.token)
          .filter((token) => !this._pricesService.getWatchList().has(token));

        this._pricesService.addToWatchList(newTokens);
        this._pricesService.fetchPrices(newTokens);

        return wallets;
      });
  });

  fetchWallets(config: GetWalletsConfig) {
    this._requestConfig = config;

    this.reload();
  }
}
