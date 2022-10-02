import { action, flow, makeObservable, observable, reaction, when } from 'mobx';
import assert from 'ts-invariant';
import { injectable } from 'tsyringe';

import { SDListViewModel } from 'new/core/viewmodels/SDListViewModel';
import { SDFetcherState } from 'new/core/viewmodels/SDViewModel';
import { excludingSpecialTokens, Wallet } from 'new/sdk/SolanaSDK';
import { PricesService } from 'new/services/PriceAPIs/PricesService';
import { WalletsRepository } from 'new/services/Repositories';
import { SolanaService } from 'new/services/SolanaService';

@injectable()
export class ChooseWalletViewModel extends SDListViewModel<Wallet> {
  selectedWallet: Wallet | null;
  private _myWallets: Wallet[];
  showOtherWallets: boolean | null;
  keyword: string;
  isOpen: boolean;
  private _staticWallets: Wallet[] | null;

  constructor(
    private _walletsRepository: WalletsRepository,
    // private _tokensRepository: TokensRepository,
    private _solanaSDK: SolanaService,
    private _pricesService: PricesService,
  ) {
    super();

    this.selectedWallet = null;
    this._myWallets = [];
    this.showOtherWallets = null;
    this.keyword = '';
    this.isOpen = false;
    this._staticWallets = null;

    makeObservable<ChooseWalletViewModel, '_myWallets' | '_staticWallets'>(this, {
      selectedWallet: observable,
      _myWallets: observable,
      showOtherWallets: observable,
      keyword: observable,
      isOpen: observable,
      _staticWallets: observable,

      setCustomFilter: action,
      setStaticWallets: action,
      setShowOtherWallets: action,
      setIsOpen: action,

      createRequest: flow,
      search: action,
      selectWallet: action,
    });
  }

  protected override setDefaults() {
    this.selectedWallet = null;
    this._myWallets = [];
    this.showOtherWallets = null;
    this.keyword = '';
    this.isOpen = false;
    this._staticWallets = null;
  }

  setCustomFilter(filter?: (wallet: Wallet) => boolean): void {
    this.customFilter = filter;
  }

  setStaticWallets(wallets: Wallet[] | null): void {
    this._staticWallets = wallets;
  }

  setShowOtherWallets(state: boolean): void {
    this.showOtherWallets = state;
  }

  setIsOpen(state: boolean): void {
    this.isOpen = state;
  }

  protected override onInitialize() {
    this.addReaction(
      when(
        () => this._walletsRepository.state === SDFetcherState.loaded, // TODO: really wait until wallets load?
        () => {
          this._myWallets = this._staticWallets ?? this._walletsRepository.getWallets();
          this.reload();
        },
      ),
    );

    this.addReaction(
      reaction(
        () => this._staticWallets, // TODO: maybe can do better
        () => {
          this._myWallets = this._staticWallets ?? this._walletsRepository.getWallets();
          this.reload();
        },
      ),
    );
  }

  protected override afterReactionsRemoved() {}

  // Request

  override createRequest = flow<Wallet[], []>(function* (
    this: ChooseWalletViewModel,
  ): Generator<Promise<Wallet[]>> {
    assert(this.showOtherWallets !== null, 'Set showOtherWallets');

    if (this.showOtherWallets) {
      return yield this._solanaSDK
        .getTokensList()
        .then((tokens) => excludingSpecialTokens(tokens))
        .then((tokens) =>
          tokens
            .filter((token) => token.symbol !== 'SOL')
            .map(
              (token) =>
                new Wallet({
                  pubkey: null,
                  lamports: null,
                  token,
                }),
            ),
        )
        .then((wallets) => {
          return this._myWallets.concat(
            wallets.filter(
              (otherWallet) =>
                !this._myWallets.some((wallet) => wallet.token.symbol === otherWallet.token.symbol),
            ),
          );
        });
    }
    return yield Promise.resolve(this._myWallets);
  });

  override map(newData: Wallet[]): Wallet[] {
    let data = super.map(newData);
    const keyword = this.keyword;
    if (keyword) {
      data = data.filter((wallet) => hasKeyword(wallet, keyword));
    }
    return data;
  }

  // Actions

  search(keyword: string): void {
    if (this.keyword === keyword) {
      return;
    }
    this.keyword = keyword;
    this.reload();
  }

  selectWallet(wallet: Wallet | null) {
    this.selectedWallet = wallet;
    if (wallet) {
      this._pricesService.addToWatchList([wallet.token]);
      this._pricesService.fetchPrices([wallet.token]);
    }
  }
}

function hasKeyword(wallet: Wallet, keyword: string): boolean {
  return (
    wallet.token.symbol.toLowerCase().startsWith(keyword.toLowerCase()) ||
    wallet.token.symbol.toLowerCase().includes(keyword.toLowerCase()) ||
    wallet.token.name.toLowerCase().startsWith(keyword.toLowerCase()) ||
    wallet.token.name.toLowerCase().includes(keyword.toLowerCase())
  );
}
