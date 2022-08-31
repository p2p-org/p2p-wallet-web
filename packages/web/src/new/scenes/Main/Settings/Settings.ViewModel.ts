import { action, makeObservable, observable, runInAction } from 'mobx';
import { singleton } from 'tsyringe';

import { Fiat } from 'new/app/models/Fiat';
import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { Appearance } from 'new/services/Defaults';
import { Defaults } from 'new/services/Defaults';
import { NameService } from 'new/services/NameService';
import { PricesService } from 'new/services/PriceAPIs/PricesService';
import { SolanaService } from 'new/services/SolanaService';

@singleton()
export class SettingsViewModel extends ViewModel {
  username?: string;

  constructor(
    private _pricesService: PricesService,
    private _solanaService: SolanaService,
    private _nameService: NameService,
  ) {
    super();

    makeObservable(this, {
      username: observable,
    });
  }

  protected override setDefaults() {}

  protected override onInitialize() {
    void this._nameService
      .getName(this._solanaService.provider.wallet.publicKey.toBase58())
      .then(action((name) => name && (this.username = name)));
  }

  protected override afterReactionsRemoved() {}

  get pubkeyBase58(): string {
    return this._solanaService.provider.wallet.publicKey.toBase58();
  }

  setFiat(fiat: Fiat) {
    runInAction(() => (Defaults.fiat = new Fiat(fiat.type)));
    this._pricesService.fetchAllTokensPriceInWatchList();
  }

  setAppearance(appearance: Appearance): void {
    runInAction(() => (Defaults.appearance = appearance));
  }

  setHideZeroBalances(value: boolean): void {
    runInAction(() => (Defaults.hideZeroBalances = value));
  }

  setUseFreeTransactions(value: boolean): void {
    runInAction(() => (Defaults.useFreeTransactions = value));
  }
}
