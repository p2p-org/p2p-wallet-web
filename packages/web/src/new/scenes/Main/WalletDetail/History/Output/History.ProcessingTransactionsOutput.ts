import type { ParsedTransaction } from 'new/sdk/TransactionParser';
import { StatusType } from 'new/sdk/TransactionParser';
import type { TransactionHandlerType } from 'new/services/TransactionHandler';

import type { HistoryOutput } from './History.OutputStream';

/// Combine final list with processing transactions.
///
/// Register a view model with `ProcessingTransactionRefreshTrigger` to shows new incoming transactions.
export class ProcessingTransactionsOutput implements HistoryOutput {
  /// Filters processing transaction by account address.
  accountFilter?: string;

  private _repository: TransactionHandlerType;

  constructor(accountFilter?: string) {
    this.accountFilter = accountFilter;
  }

  process(newData: ParsedTransaction[]): ParsedTransaction[] {
    let transactions: ParsedTransaction[];

    // Gets new transactions
    const accountFilter = this.accountFilter;
    if (accountFilter) {
      transactions = this._repository.getProcessingTransactions(accountFilter);
    } else {
      transactions = this._repository.getProcessingTransaction();
    }

    // Sorts by date
    // TODO: Check sort
    transactions.sort((left, right) => {
      const leftTime = left.blockTime?.getTime();
      const rightTime = right.blockTime?.getTime();
      if (!leftTime || !rightTime) {
        return -1;
      }
      return leftTime - rightTime;
    });

    /// Applies to output list
    let data = [...newData];
    for (const transaction of transactions.reverse()) {
      // update if exists and is being processed
      const index = data.findIndex((tx) => tx.signature === transaction.signature);
      if (index) {
        if (data[index]!.status.type !== StatusType.confirmed) {
          data[index] = transaction;
        }
      }
      // append if not
      else {
        if (transaction.signature) {
          data = data.filter((tx) => tx.signature);
        }
        data.unshift(transaction);
      }
    }
    return data;
  }
}
