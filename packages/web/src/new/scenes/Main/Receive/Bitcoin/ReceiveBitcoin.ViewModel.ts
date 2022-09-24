import { action, makeObservable, observable, reaction, runInAction } from 'mobx';
import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { getFormattedHMS } from 'new/scenes/Main/Receive/Bitcoin/utils';
import {
  BlockstreamInfoStatus,
  LockAndMintIncomingTransaction,
  LockAndMintProcessingTx,
} from 'new/sdk/RenVM/actions/LockAndMint';
import type { LockAndMintServiceDelegate } from 'new/sdk/RenVM/services/LockAndMintService/LoackAndMintServiceDelegate';

@singleton()
export class ReceiveBitcoinViewModel extends ViewModel implements LockAndMintServiceDelegate {
  address?: string;
  processingTxs: LockAndMintProcessingTx[] = [];
  sessionEndDate: number | null = null;
  isLoading = false;
  secondsPassed = -1;
  remainingTime = '35:59:59';

  timer?: NodeJS.Timer;

  constructor() {
    // private _lockAndMintService: LockAndMintService, // private _persistentStore: LockAndMintServicePersistentStore,
    super();

    makeObservable(this, {
      address: observable,
      processingTxs: observable,
      sessionEndDate: observable,
      isLoading: observable,
      secondsPassed: observable,
      remainingTime: observable,

      lockAndMintServiceWillStartLoading: action,
      lockAndMintServiceLoaded: action,
      lockAndMintServiceWithError: action,
      lockAndMintServiceUpdated: action,
    });

    runInAction(() => {
      this.processingTxs = [
        new LockAndMintProcessingTx({
          tx: new LockAndMintIncomingTransaction({
            txid: 'qweqwe',
            vout: 3,
            value: 150_000,
            status: new BlockstreamInfoStatus({ confirmed: false }),
          }),
          isProcessing: true,
          oneVoteAt: Date.now(),
          twoVoteAt: Date.now(),
          threeVoteAt: Date.now(),
          confirmedAt: Date.now(),
          submittedAt: Date.now(),
          mintedAt: Date.now(),
        }),
        new LockAndMintProcessingTx({
          tx: new LockAndMintIncomingTransaction({
            txid: 'qweqwe',
            vout: 3,
            value: 2_500_000,
            status: new BlockstreamInfoStatus({ confirmed: false }),
          }),
          isProcessing: true,
          oneVoteAt: Date.now(),
          twoVoteAt: Date.now(),
          threeVoteAt: Date.now(),
          confirmedAt: Date.now(),
          submittedAt: Date.now(),
          mintedAt: Date.now(),
        }),
      ];

      this.address = '2NAeYXJnuPXCkBRHY5Qf8AFEe6PyZP81Zz6';
    });
  }

  protected override setDefaults() {}

  protected override onInitialize() {
    this._bind();
  }

  protected override afterReactionsRemoved() {}

  private _bind(): void {
    // update remainingTime
    this.addReaction(
      reaction(
        () => this.secondsPassed,
        () => {
          const endAt = this.sessionEndDate;
          if (!endAt) {
            return '35:59:59';
          }

          const millisecondsRemains = Date.now() - endAt;

          this.remainingTime = getFormattedHMS(millisecondsRemains);
        },
      ),
    );

    //TODO: debug

    // timer

    // this.timer = setInterval(() => this._checkSessionEnd(), 1_000);
    // this._checkSessionEnd();

    // listen to lockAndMintService
    // this._lockAndMintService.delegate = this;

    // if (this._lockAndMintService.isLoading) {
    //   runInAction(() => (this.isLoading = true));
    // }

    // const address = this._persistentStore.gatewayAddress;
    // if (address) {
    //   runInAction(() => (this.address = address));
    // }
  }

  _checkSessionEnd(): void {
    const endAt = this._persistentStore.session.endAt;

    if (Date.now() >= endAt) {
      clearInterval(this.timer);
      this.timer = undefined;

      this._lockAndMintService.expireCurrentSession();
    } else {
      runInAction(() => this.secondsPassed++);
    }
  }

  async acceptConditionAndLoadAddress(): Promise<void> {
    const session = this._persistentStore.session;
    if (!session?.isValid) {
      await this._lockAndMintService.createSession();
    }
  }

  // Delegated methods

  lockAndMintServiceWillStartLoading(): void {
    this.isLoading = true;
  }

  /// Loaded
  lockAndMintServiceLoaded(gatewayAddress: string): void {
    this.address = gatewayAddress;

    const endAt = this._persistentStore.session.endAt;
    this.sessionEndDate = endAt;
  }

  /// Stop loading with error
  lockAndMintServiceWithError(): void {
    this.sessionEndDate = null;
  }

  /// Transactions updated
  lockAndMintServiceUpdated(processingTransactions: LockAndMintProcessingTx[]): void {
    this.processingTxs = processingTransactions;
  }
}
