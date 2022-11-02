import type { FeeAmount, TransactionInfo } from 'new/sdk/SolanaSDK';

/// A strategy for parsing fee.
export interface FeeParseStrategy {
  /// Retrieves transaction fee.
  ///
  /// - Parameters:
  ///   - transactionInfo: raw transaction
  ///   - feePayers: a additional fee payer addresses
  /// - Returns: fee
  calculate({
    transactionInfo,
    feePayers,
  }: {
    transactionInfo: TransactionInfo;
    feePayers: string[];
  }): Promise<FeeAmount>;
}
