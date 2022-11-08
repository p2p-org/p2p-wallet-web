import type { ParsedTransaction } from 'new/sdk/TransactionParser';
import { StatusType } from 'new/sdk/TransactionParser';

export function parsedTransactionStatusLabel(transaction: ParsedTransaction): string {
  switch (transaction.status.type) {
    case StatusType.requesting:
      return 'Sending';
    case StatusType.processing:
      return 'Pending';
    case StatusType.confirmed:
      return 'Completed';
    case StatusType.error:
      return 'Error';
  }
}

export type StatusIndicatorColor = 'pending' | 'completed' | 'error';

export function parsedTransactionStatusIndicatorColor(
  transaction: ParsedTransaction,
): StatusIndicatorColor {
  switch (transaction.status.type) {
    case StatusType.requesting:
    case StatusType.processing:
      return 'pending';
    case StatusType.confirmed:
      return 'completed';
    case StatusType.error:
      return 'error';
  }
}
