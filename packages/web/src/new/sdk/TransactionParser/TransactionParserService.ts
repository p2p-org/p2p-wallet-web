import type { TransactionInfo } from 'new/sdk/SolanaSDK';

import type { ParsedTransaction } from './model/ParsedTransaction';

/// An additional parsing configuration
export interface Configuration {
  /// An optional account address that is responsible for this transaction.
  accountView?: string;

  /// An optional token symbol that is responsible for this transaction.
  symbolView?: string;

  /// A optional account addresses that covert a fee for this transaction.
  feePayers: string[];
}

/// The interface that is responsible for parsing raw transaction into user-friendly transaction.
///
/// The user-friendly transactions are easier to read and displaying to end users.
export interface TransactionParserService {
  /// Parses a raw transaction
  ///
  /// - Parameters:
  ///   - transactionInfo: a raw transaction from SolanaSwift.
  ///   - configuration: a additional configuration that improve parsing accuracy.
  /// - Returns: a user-friendly parsed transaction
  parse({
    transactionInfo,
    config,
  }: {
    transactionInfo: TransactionInfo; // @ios: TransactionInfo
    config: Configuration;
  }): Promise<ParsedTransaction>;
}
