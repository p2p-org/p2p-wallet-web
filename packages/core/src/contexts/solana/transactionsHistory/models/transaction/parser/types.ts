import type { ParsedConfirmedTransaction } from '@solana/web3.js';

import type { CustomParsedTransaction } from './parsers';

export type TransactionInfo = ParsedConfirmedTransaction & {
  data: CustomParsedTransaction;
};

/**
 * Parsed transaction with additional info.
 */
export type ParsedTransactionInfo = {
  transactionId: string;
  transactionInfo: TransactionInfo;
  raw: ParsedConfirmedTransaction;
};

export type ParsedTransactionDatum = ParsedTransactionInfo | undefined | null;
