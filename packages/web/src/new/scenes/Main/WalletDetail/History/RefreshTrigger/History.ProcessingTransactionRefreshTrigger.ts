import { injectable } from 'tsyringe';

import { TransactionHandler } from 'new/services/TransactionHandler';

import type { HistoryRefreshTrigger } from './History.RefreshTrigger';

/// Refreshing history if processing transaction appears.
///
/// This class have to be use with `ProcessingTransactionsOutput`
@injectable()
export class ProcessingTransactionRefreshTrigger implements HistoryRefreshTrigger {
  constructor(private _repository: TransactionHandler) {}

  register(): Promise<void> {
    return this._repository.observeProcessingTransactions();
  }
}
