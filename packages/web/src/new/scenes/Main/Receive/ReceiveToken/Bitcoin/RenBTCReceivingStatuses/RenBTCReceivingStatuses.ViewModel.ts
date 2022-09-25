import { action, reaction, runInAction } from 'mobx';
import { delay, inject, singleton } from 'tsyringe';

import { SDListViewModel } from 'new/core/viewmodels/SDListViewModel';
import { SDFetcherState } from 'new/core/viewmodels/SDViewModel';
import type { ProcessingTx } from 'new/sdk/RenVM';

import { ReceiveBitcoinViewModel } from '../ReceiveBitcoin.ViewModel';

@singleton()
export class RenBTCReceivingStatusesViewModel extends SDListViewModel<ProcessingTx> {
  override state = SDFetcherState.loaded;

  constructor(
    @inject(delay(() => ReceiveBitcoinViewModel))
    private _receiveBitcoinViewModel: Readonly<ReceiveBitcoinViewModel>,
  ) {
    super();
  }

  protected override setDefaults() {}

  protected override onInitialize() {
    this._bind();
  }

  protected override afterReactionsRemoved() {}

  private _bind(): void {
    this.addReaction(
      reaction(
        () => this._receiveBitcoinViewModel.processingTxs,
        action((processingTxs) => {
          this.data = processingTxs.reverse();
        }),
      ),
    );

    runInAction(() => {
      this.data = this._receiveBitcoinViewModel.processingTxs.reverse();
    });
  }

  override reload() {
    // do nothing
  }

  override fetchNext() {
    // do nothing
  }
}
