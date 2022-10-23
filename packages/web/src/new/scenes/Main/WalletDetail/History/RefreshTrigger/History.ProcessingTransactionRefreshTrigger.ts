import type { TransactionHandler } from 'new/services/TransactionHandler';

import type { HistoryRefreshTrigger } from './History.RefreshTrigger';

/// Refreshing history if processing transaction appears.
///
/// This class have to be use with `ProcessingTransactionsOutput`
export class ProcessingTransactionRefreshTrigger implements HistoryRefreshTrigger {
  private _repository: TransactionHandler;

  constructor({ transactionHandler }: { transactionHandler: TransactionHandler }) {
    this._repository = transactionHandler;
  }

  register(): Promise<void> {
    return this._repository.observeProcessingTransactions();
  }
}
