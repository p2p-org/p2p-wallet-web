import { ZERO } from '@orca-so/sdk';
import { action, computed, makeObservable, observable, reaction } from 'mobx';
import { injectable } from 'tsyringe';

import { SDFetcherState } from 'new/core/viewmodels/SDViewModel';
import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { Defaults } from 'new/services/Defaults';
import { NameService } from 'new/services/NameService';
import { PricesService } from 'new/services/PriceAPIs/PricesService';
import { WalletsRepository } from 'new/services/Repositories';

@injectable()
export class HomeViewModel extends ViewModel {
  username: string | null | undefined;

  constructor(
    public walletsRepository: WalletsRepository,
    public pricesService: PricesService,
    public nameService: NameService,
  ) {
    super();

    makeObservable(this, {
      username: observable,
      isWalletReady: computed,
      balance: computed,
      isBalanceLoading: computed,
      changeUsername: action,
    });
  }

  protected override onInitialize() {
    this.walletsRepository.initialize();

    this.addReaction(
      reaction(
        () => !!this.walletsRepository.nativeWallet?.pubkey,
        () => {
          this._getUsername();
        },
      ),
    );
  }

  protected override afterReactionsRemoved() {
    this.walletsRepository.end();
  }

  private _getUsername() {
    if (this.walletsRepository.nativeWallet?.pubkey) {
      void this.nameService.getName(this.walletsRepository.nativeWallet.pubkey).then((username) => {
        this.changeUsername(username);
      });
    }
  }

  changeUsername(username: string | null) {
    this.username = username;
  }

  get isWalletReady(): boolean {
    const state = this.walletsRepository.state;
    const data = this.walletsRepository.dataObservable;

    // if loaded
    // TODO: track previous
    if (data?.length) {
      if (state === SDFetcherState.loading || state === SDFetcherState.initializing) {
        const amount =
          data?.reduce((partialResult, wallet) => partialResult.add(wallet.amount.toU64()), ZERO) ??
          ZERO;

        return amount.gt(ZERO);
      } else {
        const amount =
          data?.reduce((partialResult, wallet) => partialResult.add(wallet.amount.toU64()), ZERO) ??
          ZERO;
        return amount.gt(ZERO);
      }
    }

    // Not loaded
    return true;
  }

  get balance(): string {
    const data = this.walletsRepository.dataObservable ?? [];
    const state = this.walletsRepository.state;

    switch (state) {
      case SDFetcherState.initializing:
        return '';
      case SDFetcherState.loading:
        return 'Loading...';
      case SDFetcherState.loaded: {
        const equityValue = data.reduce(
          (partialResult, wallet) => partialResult + wallet.amountInCurrentFiat,
          0,
        );
        return `${Defaults.fiat.symbol} ${equityValue.toFixed(2)}`;
      }
      case SDFetcherState.error:
        return 'Error';
    }
  }

  get isBalanceLoading() {
    return this.walletsRepository.state === SDFetcherState.loading;
  }
}
