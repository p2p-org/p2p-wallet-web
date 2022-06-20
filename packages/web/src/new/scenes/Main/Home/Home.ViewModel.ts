import { ZERO } from '@orca-so/sdk';
import { computed, makeObservable } from 'mobx';
import { injectable } from 'tsyringe';

import { SDFetcherState } from 'new/core/viewmodels/SDViewModel';
import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { Defaults } from 'new/services/Defaults';
import { PricesService } from 'new/services/PriceAPIs/PricesService';
import { WalletsRepository } from 'new/services/Repositories';

@injectable()
export class HomeViewModel extends ViewModel {
  constructor(public walletsRepository: WalletsRepository, public pricesService: PricesService) {
    super();

    makeObservable(this, {
      isWalletReady: computed,
      balance: computed,
      isBalanceLoading: computed,
    });
  }

  protected override onInitialize() {
    this.walletsRepository.initialize();
  }

  protected override afterReactionsRemoved() {
    this.walletsRepository.end();
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
