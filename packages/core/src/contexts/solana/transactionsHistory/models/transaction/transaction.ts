/**
 * A transaction that may or may not exist.
 */
import type { ParsedConfirmedTransaction } from '@solana/web3.js';

import type { CustomParsedTransaction } from '.';

export interface Transaction<T extends CustomParsedTransaction> {
  key: string;
  loading: boolean;
  raw: ParsedConfirmedTransaction | undefined;
  data: T | null;
}
