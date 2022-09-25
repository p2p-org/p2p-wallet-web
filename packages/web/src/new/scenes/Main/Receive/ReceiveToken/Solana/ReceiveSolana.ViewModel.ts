import { action, computed, makeObservable, observable } from 'mobx';
import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { NameService } from 'new/services/NameService';
import { SolanaService } from 'new/services/SolanaService';

@singleton()
export class ReceiveSolanaViewModel extends ViewModel {
  username?: string;

  constructor(private _solanaSDK: SolanaService, private _nameService: NameService) {
    super();

    makeObservable(this, {
      username: observable,
      pubkeyBase58: computed,
    });
  }

  protected override setDefaults() {}

  protected override onInitialize() {
    void this._nameService
      .getName(this.pubkeyBase58)
      .then(action((name) => name && (this.username = name)));
  }

  protected override afterReactionsRemoved() {}

  get pubkeyBase58(): string {
    return this._solanaSDK.provider.wallet.publicKey.toBase58();
  }
}
