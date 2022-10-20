import { injectable } from 'tsyringe';

import type { ParsedTransaction } from 'new/sdk/TransactionParser';
import type { PricesServiceType } from 'new/services/PriceAPIs/PricesService';

import type { HistoryOutput } from './History.OutputStream';

/// Update apply exchange rate to transaction to show price information
@injectable()
export class PriceUpdatingOutput implements HistoryOutput {
  private _pricesService: PricesServiceType;

  process(newData: ParsedTransaction[]): ParsedTransaction[] {
    const transactions = [...newData];
    // eslint-disable-next-line @typescript-eslint/no-for-in-array
    for (const index in transactions) {
      transactions[index] = this._updatedTransactionWithPrice(transactions[index]!);
    }
    return transactions;
  }

  private _updatedTransactionWithPrice(transaction: ParsedTransaction): ParsedTransaction {
    const price = this._pricesService.currentPrice(transaction.symbol)?.value;
    if (!price) {
      return transaction;
    }

    const transactionNew = transaction;
    const amount = transactionNew.amount;
    transaction.amountInFiat = amount * price;

    return transaction;
  }
}
