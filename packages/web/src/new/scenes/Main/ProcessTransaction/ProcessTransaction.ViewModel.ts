import { makeObservable, observable } from 'mobx';
import { injectable } from 'tsyringe';

import { PendingTransaction, TransactionStatus } from 'new/app/models/PendingTransaction';
import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { SolanaSDKError } from 'new/sdk/SolanaSDK';
import { TransactionHandler } from 'new/services/TransactionHandler';

import type { RawTransactionType } from './ProcessTransaction.Models';

interface ProcessTransactionViewModelType {
  pendingTransaction: PendingTransaction;
  observingTransactionIndex: number | null;
}

@injectable()
export class ProcessTransactionViewModel
  extends ViewModel
  implements ProcessTransactionViewModelType
{
  pendingTransaction: PendingTransaction;
  observingTransactionIndex: number | null = null;

  rawTransaction: RawTransactionType;

  constructor(private _transactionHandler: TransactionHandler) {
    super();

    const processingTransaction = '';

    this.rawTransaction = processingTransaction;

    this.pendingTransaction = new PendingTransaction({
      transactionId: null,
      sentAt: new Date(),
      rawTransaction: processingTransaction,
      status: TransactionStatus.sending(),
    });

    makeObservable(this, {
      pendingTransaction: observable,
      observingTransactionIndex: observable,

      rawTransaction: observable,
    });
  }

  protected override onInitialize() {}

  protected override afterReactionsRemoved() {}

  get isSwapping(): boolean {
    return this.rawTransaction.isSwap;
  }

  get transactionID(): string | null {
    return this.pendingTransaction.transactionId;
  }

  getMainDescription(): string {
    return this.rawTransaction.mainDescription;
  }

  // Actions

  sendAndObserveTransaction(): void {
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
    // TODO: it should wait
    this.pendingTransaction =
      this._transactionHandler.observeTransaction(index) ?? unknownErrorInfo;
  }
}
