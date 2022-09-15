import { action, flow, makeObservable, observable, when } from 'mobx';
import assert from 'ts-invariant';
import { delay, inject, injectable } from 'tsyringe';

import { SDListViewModel } from 'new/core/viewmodels/SDListViewModel';
import { SDFetcherState } from 'new/core/viewmodels/SDViewModel';
import { SendViewModel } from 'new/scenes/Main/Send';
import { excludingSpecialTokens, Wallet } from 'new/sdk/SolanaSDK';
import { PricesService } from 'new/services/PriceAPIs/PricesService';
import { WalletsRepository } from 'new/services/Repositories';
import { SolanaService } from 'new/services/SolanaService';

@injectable()
export class ChooseWalletViewModel extends SDListViewModel<Wallet> {
  selectedWallet: Wallet | null;
  _myWallets: Wallet[];
  showOtherWallets: boolean | null;
  keyword: string;
  isOpen: boolean;

  constructor(
    private _walletsRepository: WalletsRepository,
    // private _tokensRepository: TokensRepository,
    private _solanaSDK: SolanaService,
    private _pricesService: PricesService,
    @inject(delay(() => SendViewModel)) public sendViewModel: Readonly<SendViewModel>,
  ) {
    super();

    this.selectedWallet = null;
    this._myWallets = [];
    this.showOtherWallets = null;
    this.keyword = '';
    this.isOpen = false;

    makeObservable(this, {
      selectedWallet: observable,
      _myWallets: observable,
      showOtherWallets: observable,
      keyword: observable,
      isOpen: observable,

      createRequest: flow,
      search: action,
      selectWallet: action,

      setCustomFilter: action,
      setShowOtherWallets: action,
      setIsOpen: action,
    });
  }

  protected override setDefaults() {
    this.selectedWallet = null;
    this._myWallets = [];
    this.showOtherWallets = null;
    this.keyword = '';
    this.isOpen = false;
  }

  protected override onInitialize() {
    this.addReaction(
      when(
        () => this._walletsRepository.state === SDFetcherState.loaded, // TODO: really wait until wallets load?
        () => {
          this._myWallets = this._walletsRepository.getWallets();
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

  //

  setCustomFilter(filter: (wallet: Wallet) => boolean): void {
    this.customFilter = filter;
  }

  setShowOtherWallets(state: boolean): void {
    this.showOtherWallets = state;
  }

  setIsOpen(state: boolean): void {
    this.isOpen = state;
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
