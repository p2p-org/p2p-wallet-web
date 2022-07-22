import { action, flow, makeObservable, observable, reaction } from 'mobx';
import { injectable } from 'tsyringe';

import { SDListViewModel } from 'new/core/viewmodels/SDListViewModel';
import { excludingSpecialTokens, Wallet } from 'new/sdk/SolanaSDK';
import { PricesService } from 'new/services/PriceAPIs/PricesService';
import { WalletsRepository } from 'new/services/Repositories';
import { SolanaService } from 'new/services/SolanaService';

@injectable()
export class ChooseWalletViewModel extends SDListViewModel<Wallet> {
  selectedWallet: Wallet | null;
  myWallets: Wallet[];
  showOtherWallets: boolean;
  keyword = '';

  constructor(
    private _walletsRepository: WalletsRepository,
    // private _tokensRepository: TokensRepository,
    private _solanaSDK: SolanaService,
    private _pricesService: PricesService,
  ) {
    super();

    this.selectedWallet = null;
    this.showOtherWallets = false;
    this.myWallets = this._walletsRepository.getWallets();

    makeObservable(this, {
      selectedWallet: observable,
      myWallets: observable,
      keyword: observable,

      createRequest: flow,
      search: action,
      selectWallet: action,
    });
  }

  protected override onInitialize() {
    // TODO: check that it needed
    this.addReaction(
      reaction(
        () => this._walletsRepository.getWallets(),
        () => {
          this.myWallets = this._walletsRepository.getWallets();
          this.reload();
        },
      ),
    );
  }

  protected override afterReactionsRemoved() {}

  // Request

  override createRequest = flow(function* (
    this: ChooseWalletViewModel,
  ): Generator<Promise<Wallet[]>> {
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
          return this.myWallets
            .concat(...wallets)
            .filter(
              (otherWallet) =>
                !this.myWallets.some((wallet) => wallet.token.symbol === otherWallet.token.symbol),
            );
        });
    }
    return yield Promise.resolve(this.myWallets);
  });

  override customFilter(wallet: Wallet): boolean {
    return wallet.amount.greaterThan(0);
  }

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

  selectWallet(wallet: Wallet) {
    // TODO: handler
    this.selectedWallet = wallet;
    this._pricesService.addToWatchList([wallet.token.symbol]);
    this._pricesService.fetchPrices([wallet.token.symbol]);
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
