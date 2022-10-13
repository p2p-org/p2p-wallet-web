import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { SolanaModel } from 'new/models/SolanaModel';
import { BurnAndReleaseService, LockAndMintService } from 'new/services/RenVM';
import { WalletsRepository } from 'new/services/Repositories';

@singleton()
export class MainViewModel extends ViewModel {
  constructor(
    private _solanaModel: SolanaModel,
    public walletsRepository: WalletsRepository,
    private _burnAndRelease: BurnAndReleaseService,
    private _lockAndMint: LockAndMintService,
  ) {
    super();
  }

  protected override setDefaults() {}

  protected override onInitialize() {
    this._solanaModel.initialize();
    this.walletsRepository.initialize();
    this._burnAndRelease.resume();
    void this._lockAndMint.resume();
  }

  protected override afterReactionsRemoved() {
    this._solanaModel.end();
    this.walletsRepository.end();
  }
}
