import type { ParsedTransaction } from 'new/sdk/TransactionParser';

/// This protocol that maps, updates, filters and forms the output of transactions.
export interface HistoryOutput {
  /// Transform incoming data
  ///
  /// - Parameter newData: incoming data
  /// - Returns: transformed data
  process(newData: ParsedTransaction[]): ParsedTransaction[];
}
