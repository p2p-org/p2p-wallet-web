/// A parse strategy

import type { TransactionInfo } from 'new/sdk/SolanaSDK';

import type { ParsedTransactionInfoType } from '../model/ParsedTransaction';
import type { Configuration } from '../TransactionParserService';

export interface TransactionParseStrategy {
  /// Check is current parsing strategy can handle this transaction
  isHandlable(transactionInfo: TransactionInfo): boolean;

  /// Parse a transaction
  parse({
    transactionInfo,
    config,
  }: {
    transactionInfo: TransactionInfo;
    config: Configuration;
  }): Promise<ParsedTransactionInfoType | null>;
}
