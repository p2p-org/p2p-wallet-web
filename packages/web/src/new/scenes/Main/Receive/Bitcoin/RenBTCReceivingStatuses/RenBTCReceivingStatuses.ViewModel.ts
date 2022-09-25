import { action, reaction, runInAction } from 'mobx';
import { delay, inject, singleton } from 'tsyringe';

import { SDListViewModel } from 'new/core/viewmodels/SDListViewModel';
import { SDFetcherState } from 'new/core/viewmodels/SDViewModel';
import { ReceiveBitcoinViewModel } from 'new/scenes/Main/Receive/Bitcoin/ReceiveBitcoin.ViewModel';
import type { LockAndMintProcessingTx } from 'new/sdk/RenVM/actions/LockAndMint';

@singleton()
export class RenBTCReceivingStatusesViewModel extends SDListViewModel<LockAndMintProcessingTx> {
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
