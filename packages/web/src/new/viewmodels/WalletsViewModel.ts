import { action, computed, makeObservable } from 'mobx';
import { injectable } from 'tsyringe';

import type { Wallet } from 'new/app/sdk/SolanaSDK';
import { WalletsRepository } from 'new/services/Repositories';

import { ViewModel } from './ViewModel';

@injectable()
export class WalletsViewModel extends ViewModel {
  constructor(protected walletsRepository: WalletsRepository) {
    super();
    makeObservable(this, {
      state: computed,
      wallets: computed,
      isHiddenWalletsShown: computed,
      toggleIsHiddenWalletShown: action,
      toggleWalletVisibility: action,
    });
  }

  protected onInitialize(): void {
    this.walletsRepository.initialize();
  }
  protected afterReactionsRemoved(): void {
    this.walletsRepository.end();
  }

  get state() {
    return this.walletsRepository.state;
  }

  get wallets() {
    return this.walletsRepository.data;
  }

  get isHiddenWalletsShown() {
    return this.walletsRepository.isHiddenWalletsShown;
  }

  toggleIsHiddenWalletShown = (): void => {
    this.walletsRepository.toggleIsHiddenWalletShown();
  };

  toggleWalletVisibility = (wallet: Wallet): void => {
    this.walletsRepository.toggleWalletVisibility(wallet);
  };
}
