import { action, makeObservable, observable, reaction, runInAction } from 'mobx';
import { Lifecycle, scoped } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { LockAndMintServiceDelegate, ProcessingTx } from 'new/sdk/RenVM';
import { LockAndMintService, LockAndMintServicePersistentStore } from 'new/services/RenVM';

import { RenBTCReceivingStatusesViewModel } from './RenBTCReceivingStatuses';
import { getFormattedHMS } from './utils';

@scoped(Lifecycle.ResolutionScoped)
export class ReceiveBitcoinViewModel extends ViewModel implements LockAndMintServiceDelegate {
  isLoading = false;
  timer?: NodeJS.Timer;
  address?: string | null;
  secondsPassed = -1;
  processingTxs: ProcessingTx[] = []; // @web: processingTransactions

  sessionEndDate: Date | null = null;

  remainingTime = '35:59:59';

  constructor(
    private _lockAndMintService: LockAndMintService,
    private _persistentStore: LockAndMintServicePersistentStore,
    public renBTCReceivingStatusesViewModel: RenBTCReceivingStatusesViewModel,
  ) {
    super();

    makeObservable(this, {
      isLoading: observable,
      address: observable,
      secondsPassed: observable,
      processingTxs: observable,

      sessionEndDate: observable,

      remainingTime: observable,

      lockAndMintServiceWillStartLoading: action,
      lockAndMintServiceLoaded: action,
      lockAndMintServiceWithError: action,
      lockAndMintServiceUpdated: action,
    });
  }

  protected override setDefaults() {
    this.isLoading = false;
    this.timer = undefined;
    this.address = null;
    this.secondsPassed = -1;
    this.processingTxs = [];

    this.sessionEndDate = null;

    this.remainingTime = '35:59:59';
  }

  protected override onInitialize() {
    this.renBTCReceivingStatusesViewModel.initialize();

    this._bind();
  }

  protected override afterReactionsRemoved() {
    this.renBTCReceivingStatusesViewModel.end();

    clearInterval(this.timer);
  }

  async acceptConditionAndLoadAddress(): Promise<void> {
    const session = this._persistentStore.session;
    if (!session?.isValid) {
      await this._lockAndMintService.createSession();
    }
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

          const millisecondsRemains = endAt.getTime() - Date.now();

          this.remainingTime = getFormattedHMS(millisecondsRemains);
        },
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
    const endAt = this._persistentStore.session?.endAt;
    if (!endAt) {
      return;
    }

    if (Date.now() >= endAt.getTime()) {
      clearInterval(this.timer);

      this._lockAndMintService.expireCurrentSession();
    } else {
      runInAction(() => this.secondsPassed++);
    }
  }

  // Delegated methods

  lockAndMintServiceWillStartLoading(): void {
    this.isLoading = true;
  }

  /// Loaded
  lockAndMintServiceLoaded(gatewayAddress: string): void {
    this.address = gatewayAddress;

    const endAt = this._persistentStore.session?.endAt ?? null;
    this.sessionEndDate = endAt;
  }

  /// Stop loading with error
  lockAndMintServiceWithError(): void {
    this.sessionEndDate = null;
  }

  /// Transactions updated
  lockAndMintServiceUpdated(processingTransactions: ProcessingTx[]): void {
    this.processingTxs = processingTransactions;
  }
}
