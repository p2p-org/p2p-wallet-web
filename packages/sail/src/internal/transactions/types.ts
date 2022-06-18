import type { ParsedConfirmedTransaction } from "@solana/web3.js";

import type { SailTransactionLoadError } from "../../errors";

export type KeyedTransactionInfo = {
  transactionId: string;
  transactionInfo: ParsedConfirmedTransaction;
};

/**
 * Transaction id + info.
 * This is null if the transaction could not be found, or undefined
 * if the data is still loading.
 */
export type TransactionDatum = KeyedTransactionInfo | null | undefined;

/**
 * Result of the fetching of a transaction.
 */
export interface TransactionFetchResult {
  data: TransactionDatum;
  error?: SailTransactionLoadError;
}
