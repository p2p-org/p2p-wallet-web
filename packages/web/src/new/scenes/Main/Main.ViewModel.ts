import { when } from 'mobx';
import { singleton } from 'tsyringe';

import { SDFetcherState } from 'new/core/viewmodels/SDViewModel';
import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { SolanaModel } from 'new/models/SolanaModel';
import { setUserProperty } from 'new/sdk/Analytics';
import { PricesService } from 'new/services/PriceAPIs/PricesService';
import { BurnAndReleaseService, LockAndMintService } from 'new/services/RenVM';
import { WalletsRepository } from 'new/services/Repositories';
import { rounded } from 'new/utils/NumberExtensions';

@singleton()
export class MainViewModel extends ViewModel {
  constructor(
    private _pricesService: PricesService,
    private _solanaModel: SolanaModel,
    public walletsRepository: WalletsRepository,
    private _burnAndRelease: BurnAndReleaseService,
    private _lockAndMint: LockAndMintService,
  ) {
    super();
  }

  protected override setDefaults() {}

  protected override onInitialize() {
    this._pricesService.startObserving();

    this._solanaModel.initialize();

    this.walletsRepository.initialize();
    this.walletsRepository.reload();

    this._burnAndRelease.resume();
    void this._lockAndMint.resume();

    this._bind();
  }

  protected override afterReactionsRemoved() {
    this._pricesService.stopObserving();
    this._solanaModel.end();
    this.walletsRepository.end();
  }

  private _bind(): void {
    // set Amplitude UserProperties only once - when balance is known first time
    this.addReaction(
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
      ),
    );
  }
}
