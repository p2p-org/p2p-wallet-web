import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { SolanaModel } from 'new/models/SolanaModel';
import { PricesService } from 'new/services/PriceAPIs/PricesService';
import { BurnAndReleaseService, LockAndMintService } from 'new/services/RenVM';
import { WalletsRepository } from 'new/services/Repositories';

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
    this._burnAndRelease.resume();
    void this._lockAndMint.resume();
  }

  protected override afterReactionsRemoved() {
    this._pricesService.stopObserving();
    this._solanaModel.end();
    this.walletsRepository.end();
  }
}
