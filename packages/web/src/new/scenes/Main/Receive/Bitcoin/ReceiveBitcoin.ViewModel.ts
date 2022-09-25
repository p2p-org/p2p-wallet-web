import { action, makeObservable, observable, reaction, runInAction } from 'mobx';
import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { LockAndMintProcessingTx } from 'new/sdk/RenVM/actions/LockAndMint';
import type { LockAndMintServiceDelegate } from 'new/sdk/RenVM/services/LockAndMintService/LoackAndMintServiceDelegate';
import { LockAndMintService } from 'new/sdk/RenVM/services/LockAndMintService/LockAndMintService';
import { LockAndMintServicePersistentStore } from 'new/sdk/RenVM/services/LockAndMintService/LockAndMintServicePersistentStore';

import { getFormattedHMS } from './utils';

@singleton()
export class ReceiveBitcoinViewModel extends ViewModel implements LockAndMintServiceDelegate {
  address?: string | null;
  processingTxs: LockAndMintProcessingTx[] = [];
  sessionEndDate: number | null = null;
  isLoading = false;
  secondsPassed = -1;
  remainingTime = '35:59:59';

  timer?: NodeJS.Timer;

  constructor(
    private _lockAndMintService: LockAndMintService,
    private _persistentStore: LockAndMintServicePersistentStore,
  ) {
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

    //TODO: for developing
    /*runInAction(() => {
      this.processingTxs = [
        new LockAndMintProcessingTx({
          tx: new LockAndMintIncomingTransaction({
            txid: 'qweqwe',
            vout: 3,
            value: 150_000,
            status: new BlockstreamInfoStatus({ confirmed: false }),
          }),
          isProcessing: true,
          receivedAt: Date.now(),
          oneVoteAt: Date.now() + 10_000,
          twoVoteAt: Date.now() + 20_000,
          threeVoteAt: Date.now() + 25_000,
          confirmedAt: Date.now() + 40_000,
          submittedAt: Date.now() + 50_000,
          mintedAt: Date.now() + 100_000,
        }),
        new LockAndMintProcessingTx({
          tx: new LockAndMintIncomingTransaction({
            txid: 'qweqwe123',
            vout: 3,
            value: 2_500_000,
            status: new BlockstreamInfoStatus({ confirmed: false }),
          }),
          isProcessing: true,
          receivedAt: Date.now(),
          oneVoteAt: Date.now(),
          twoVoteAt: Date.now(),
          threeVoteAt: Date.now(),
          confirmedAt: Date.now(),
          submittedAt: Date.now(),
          mintedAt: Date.now(),
        }),
      ];

      this.address = '2NAeYXJnuPXCkBRHY5Qf8AFEe6PyZP81Zz6';
    });*/
  }

  protected override setDefaults() {
    this.address = null;
    this.processingTxs = [];
    this.sessionEndDate = null;
    this.isLoading = false;
    this.secondsPassed = -1;
    this.remainingTime = '35:59:59';

    this.timer = undefined;
  }

  protected override onInitialize() {
    this._bind();
  }

  protected override afterReactionsRemoved() {
    clearInterval(this.timer);
  }

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

    this.addReaction(
      reaction(
        () => this._persistentStore.gatewayAddress,
        action((gatewayAddress) => (this.address = gatewayAddress)),
      ),
    );

    // timer

    this.timer = setInterval(() => this._checkSessionEnd(), 1_000);
    this._checkSessionEnd();

    // listen to lockAndMintService
    this._lockAndMintService.delegate = this;

    if (this._lockAndMintService.isLoading) {
      runInAction(() => (this.isLoading = true));
    }

    runInAction(() => (this.address = this._persistentStore.gatewayAddress));
  }

  _checkSessionEnd(): void {
    const endAt = this._persistentStore.session.endAt;

    if (Date.now() >= endAt) {
      clearInterval(this.timer);

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
