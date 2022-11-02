import type { IReactionDisposer } from 'mobx';
import { action, computed, makeObservable, observable } from 'mobx';
import assert from 'ts-invariant';
import { injectable } from 'tsyringe';

import { PendingTransaction, TransactionStatus } from 'new/app/models/PendingTransaction';
import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { SolanaSDKError } from 'new/sdk/SolanaSDK';
import type { TransactionIndex } from 'new/services/TransactionHandler';
import { TransactionHandler } from 'new/services/TransactionHandler';

import type { RawTransactionType } from './ProcessTransaction.Models';

interface ProcessTransactionModalViewModelType {
  pendingTransaction: PendingTransaction | null;
  observingTransactionIndex: number | null;
}

@injectable()
export class ProcessTransactionModalViewModel
  extends ViewModel
  implements ProcessTransactionModalViewModelType
{
  rawTransaction: RawTransactionType | null;
  pendingTransaction: PendingTransaction | null;
  observingTransactionIndex: TransactionIndex | null;

  constructor(private _transactionHandler: TransactionHandler) {
    super();

    this.rawTransaction = null;
    this.pendingTransaction = null;
    this.observingTransactionIndex = null;

    makeObservable(this, {
      rawTransaction: observable,
      pendingTransaction: observable,
      observingTransactionIndex: observable,

      setTransaction: action,

      isSwapping: computed,
      transactionID: computed,
      getMainDescription: computed,

      sendAndObserveTransaction: action,
    });
  }

  setTransaction(processingTransaction: RawTransactionType) {
    this.rawTransaction = processingTransaction;
    this.pendingTransaction = new PendingTransaction({
      transactionId: null,
      sentAt: new Date(),
      rawTransaction: processingTransaction,
      status: TransactionStatus.sending(),
    });
  }

  protected override setDefaults() {
    this.rawTransaction = null;
    this.pendingTransaction = null;
    this.observingTransactionIndex = null;
  }

  protected override onInitialize() {}

  protected override afterReactionsRemoved() {}

  get isSwapping(): boolean {
    assert(this.rawTransaction, 'rawTransaction is not set');
    return this.rawTransaction.isSwap;
  }

  get transactionID(): string | null {
    assert(this.pendingTransaction, 'pendingTransaction is not set');
    return this.pendingTransaction.transactionId;
  }

  get getMainDescription(): string {
    assert(this.rawTransaction, 'rawTransaction is not set');
    return this.rawTransaction.mainDescription;
  }

  // Actions

  sendAndObserveTransaction(): IReactionDisposer {
    assert(this.rawTransaction, 'rawTransaction is not set');
    // send transaction and get observation index
    const index = this._transactionHandler.sendTransaction(this.rawTransaction);
    this.observingTransactionIndex = index;

    // send and catch error
    const unknownErrorInfo = new PendingTransaction({
      transactionId: null,
      sentAt: new Date(),
      rawTransaction: this.rawTransaction,
      status: TransactionStatus.error(SolanaSDKError.unknown()),
    });

    // observe transaction based on transaction index
    return this._transactionHandler.observeTransaction(index, (pendingTransaction) => {
      this.pendingTransaction = pendingTransaction || unknownErrorInfo;
    });
  }
}
