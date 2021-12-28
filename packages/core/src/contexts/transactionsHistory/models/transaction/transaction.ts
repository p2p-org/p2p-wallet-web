/**
 * A transaction that may or may not exist.
 */
import type { ParsedConfirmedTransaction } from '@solana/web3.js';

import type { CustomParsedTransaction, TransactionDetails } from './';

export interface Transaction<T extends CustomParsedTransaction> {
  key: string;
  loading: boolean;
  data: T | null;
  details: TransactionDetails;
  raw: ParsedConfirmedTransaction | undefined;
}
