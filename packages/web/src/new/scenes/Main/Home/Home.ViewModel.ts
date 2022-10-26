import { action, computed, makeObservable, observable, reaction, when } from 'mobx';
import { singleton } from 'tsyringe';

import { SDFetcherState } from 'new/core/viewmodels/SDViewModel';
import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { setUserProperty } from 'new/sdk/Analytics';
import { Defaults } from 'new/services/Defaults';
import { ModalService, ModalType } from 'new/services/ModalService';
import { NameService } from 'new/services/NameService';
import { WalletsRepository } from 'new/services/Repositories';
import { numberToString, rounded } from 'new/utils/NumberExtensions';

@singleton()
export class HomeViewModel extends ViewModel {
  username: string | null;

  constructor(
    public walletsRepository: WalletsRepository,
    public nameService: NameService,
    private _modalService: ModalService,
  ) {
    super();

    this.username = null;

    makeObservable(this, {
      username: observable,
      isWalletReady: computed,
      balance: computed,
      isBalanceLoading: computed,
      changeUsername: action,
    });

    // set Amplitude UserProperties only once - when balance is known
    when(
      () => this.walletsRepository.state === SDFetcherState.loaded,
      () => {
        const fiatAmount = this.walletsRepository.data.reduce((acc, wallet) => {
          return acc + wallet.amountInCurrentFiat;
        }, 0);

        setUserProperty({ name: 'User_Has_Positive_Balance', value: fiatAmount > 0 });

        if (fiatAmount) {
          setUserProperty({ name: 'User_Aggregate_Balance', value: rounded(fiatAmount, 2) });
        }
      },
    );
  }

  protected override setDefaults() {
    this.username = null;
  }

  protected override onInitialize() {
    // this.walletsRepository.initialize();

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
    // this.walletsRepository.end();
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

  openChooseBuyTokenMobileModal() {
    void this._modalService.openModal(ModalType.SHOW_MODAL_CHOOSE_BUY_TOKEN_MOBILE);
  }
}
