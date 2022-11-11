import { makeObservable, observable, runInAction, when } from 'mobx';
import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { SolanaModel } from 'new/models/SolanaModel';
import { NameService } from 'new/services/NameService';
import { BurnAndReleaseService, LockAndMintService } from 'new/services/RenVM';
import { WalletsRepository } from 'new/services/Repositories';

@singleton()
export class MainViewModel extends ViewModel {
  username: string | null = null;

  constructor(
    public walletsRepository: WalletsRepository,
    private _solanaModel: SolanaModel,
    private _burnAndRelease: BurnAndReleaseService,
    private _lockAndMint: LockAndMintService,
    private _nameService: NameService,
  ) {
    super();
    makeObservable(this, {
      username: observable,
    });
  }

  protected override setDefaults() {}

  protected override onInitialize() {
    this._solanaModel.initialize();
    this.walletsRepository.initialize();
    this._burnAndRelease.resume();
    void this._lockAndMint.resume();

    this.addReaction(
      when(
        () => Boolean(this.walletsRepository.nativeWallet?.pubkey),
        () => {
          void this._nameService
            .getName(this.walletsRepository.nativeWallet!.pubkey!)
            .then((username) => {
              runInAction(() => {
                this.username = username;
              });
            });
        },
      ),
    );
  }

  protected override afterReactionsRemoved() {
    this._solanaModel.end();
    this.walletsRepository.end();
  }
}
