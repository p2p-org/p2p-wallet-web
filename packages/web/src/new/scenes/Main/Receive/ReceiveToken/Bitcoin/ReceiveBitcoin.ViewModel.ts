import type { u64 } from '@solana/spl-token';
import { action, makeObservable, observable, reaction, runInAction } from 'mobx';
import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { LockAndMintServiceDelegate, ProcessingTx } from 'new/sdk/RenVM';
import { LockAndMintService, LockAndMintServicePersistentStore } from 'new/services/RenVM';

import { getFormattedHMS } from './utils';

@singleton()
export class ReceiveBitcoinViewModel extends ViewModel implements LockAndMintServiceDelegate {
  isLoading = false;
  timer?: NodeJS.Timer;
  address?: string | null;
  secondsPassed = -1;
  processingTxs: ProcessingTx[] = []; // @web: processingTransactions
  sessionEndDate: Date | null = null;
  remainingTime = '35:59:59';
  fee: u64 | null = null;
  isFetchingFee = false;

  constructor(
    private _lockAndMintService: LockAndMintService,
    private _persistentStore: LockAndMintServicePersistentStore,
  ) {
    super();

    makeObservable(this, {
      isLoading: observable,
      address: observable,
      secondsPassed: observable,
      processingTxs: observable,
      sessionEndDate: observable,
      remainingTime: observable,
      fee: observable,
      isFetchingFee: observable,

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
    this._bind();
  }

  protected override afterReactionsRemoved() {
    clearInterval(this.timer);
  }

  async acceptConditionAndLoadAddress(): Promise<void> {
    const session = this._persistentStore.session;
    if (!session?.isValid) {
      await this._lockAndMintService.createSession();
    } else {
      this._updateSessionEndDate();
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
      runInAction(() => {
        this.isLoading = true;
      });
    }

    runInAction(() => {
      this.address = this._persistentStore.gatewayAddress;

      const endAt = this._persistentStore.session?.endAt ?? null;
      this.sessionEndDate = endAt;
    });

    // set fee
    runInAction(() => (this.isFetchingFee = true));
    void this._lockAndMintService
      .getFee()
      .then(
        action((feeAmount) => {
          this.fee = feeAmount;
          this.isFetchingFee = false;
        }),
      )
      .catch(action(() => (this.isFetchingFee = false)));
  }

  private _updateSessionEndDate(): void {
    const endAt = this._persistentStore.session?.endAt ?? null;

    runInAction(() => {
      this.sessionEndDate = endAt;
    });
  }

  private _checkSessionEnd(): void {
    const endAt = this._persistentStore.session?.endAt;
    if (!endAt) {
      return;
    }

    if (Date.now() >= endAt.getTime()) {
      clearInterval(this.timer);

      this._lockAndMintService.expireCurrentSession();
    } else {
      runInAction(() => {
        this.secondsPassed++;
      });
    }
  }

  // Delegated methods

  lockAndMintServiceWillStartLoading(): void {
    this.isLoading = true;
  }

  /// Loaded
  lockAndMintServiceLoaded(gatewayAddress: string): void {
    this.address = gatewayAddress;

    this._updateSessionEndDate();
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
