import { computed, makeObservable } from 'mobx';
import { singleton } from 'tsyringe';

import { SDFetcherState } from 'new/core/viewmodels/SDViewModel';
import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { MainViewModel } from 'new/scenes/Main/Main.ViewModel';
import { Defaults } from 'new/services/Defaults';
import { ModalService, ModalType } from 'new/services/ModalService';
import { NameService } from 'new/services/NameService';
import { WalletsRepository } from 'new/services/Repositories';
import { numberToString } from 'new/utils/NumberExtensions';

@singleton()
export class HomeViewModel extends ViewModel {
  constructor(
    public walletsRepository: WalletsRepository,
    public nameService: NameService,
    private _modalService: ModalService,
    private _mainViewModal: MainViewModel,
  ) {
    super();

    makeObservable(this, {
      username: computed,
      isWalletReady: computed,
      balance: computed,
      isBalanceLoading: computed,
    });
  }

  protected override setDefaults() {}

  protected override onInitialize() {}

  protected override afterReactionsRemoved() {
    // this.walletsRepository.end();
  }

  get isWalletReady(): boolean {
    const state = this.walletsRepository.state;
    const data = this.walletsRepository.dataObservable;

    // if loaded
    // TODO: track previous
    if (data?.length) {
      if (state === SDFetcherState.loading || state === SDFetcherState.initializing) {
        const amount =
          data?.reduce((partialResult, wallet) => partialResult + wallet.amount, 0) ?? 0;

        return amount > 0;
      } else {
        const amount =
          data?.reduce((partialResult, wallet) => partialResult + wallet.amount, 0) ?? 0;
        return amount > 0;
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
        return `${Defaults.fiat.symbol} ${numberToString(equityValue, {
          maximumFractionDigits: 2,
        })}`;
      }
      case SDFetcherState.error:
        return 'Error';
    }
  }

  get isBalanceLoading() {
    return this.walletsRepository.state === SDFetcherState.loading;
  }

  get username() {
    return this._mainViewModal.username;
  }

  openChooseBuyTokenMobileModal() {
    void this._modalService.openModal(ModalType.SHOW_MODAL_CHOOSE_BUY_TOKEN_MOBILE);
  }
}
