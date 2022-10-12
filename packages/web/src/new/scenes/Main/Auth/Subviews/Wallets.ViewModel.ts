import { flow } from 'mobx';
import { injectable } from 'tsyringe';

import { SDListViewModel } from 'new/core/viewmodels/SDListViewModel';
import type { Recipient } from 'new/scenes/Main/Send';
import type { Wallet } from 'new/sdk/SolanaSDK';

@injectable()
export class WalletsListViewModel extends SDListViewModel<Wallet> {
  constructor() {
    super();
  }

  protected override setDefaults() {}

  protected override onInitialize() {}

  protected override afterReactionsRemoved() {}

  override createRequest = flow<Wallet[], []>(function* (
    this: WalletsListViewModel,
  ): Generator<Promise<Recipient[]>> {
    console.log('**************************');
    console.log('create request');

    yield Promise.resolve(1);
  });
}
