import { injectable } from 'tsyringe';

import { WalletsRepository } from 'new/models/Repositories';

import { ViewModel } from './ViewModel';

@injectable()
export class WalletsViewModel extends ViewModel {
  constructor(protected walletsRepository: WalletsRepository) {
    super();
  }

  protected onInitialize(): void {
    this.walletsRepository.initialize();
  }
  protected afterReactionsRemoved(): void {
    this.walletsRepository.end();
  }

  get isInitialized() {
    return this.walletsRepository.isInitialized;
  }

  get tokens() {
    return this.walletsRepository.tokens;
  }
}
