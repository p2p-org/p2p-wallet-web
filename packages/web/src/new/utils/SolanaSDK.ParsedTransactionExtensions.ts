import type { ParsedTransaction } from 'new/sdk/TransactionParser';
import {
  CloseAccountInfo,
  CreateAccountInfo,
  SwapInfo,
  TransferInfo,
  TransferType,
} from 'new/sdk/TransactionParser';

// TODO: check it works
export function parsedTransactionLabel(transaction: ParsedTransaction): string {
  switch (transaction.info?.constructor) {
    case CreateAccountInfo:
      return 'Create account';
    case CloseAccountInfo:
      return 'Close account';
    case TransferInfo:
      switch ((transaction.info as TransferInfo).transferType) {
        case TransferType.send:
          return 'Transfer';
        case TransferType.receive:
          return 'Receive';
        default:
          return 'Transfer';
      }
    case SwapInfo:
      return 'Swap';
  }

  return 'Transaction';
}

// TODO: check it works
export function parsedTransactionIcon(transaction: ParsedTransaction): string {
  switch (transaction.info?.constructor) {
    case CreateAccountInfo:
      return 'wallet'; // @ios: transactionCreateAccount
    case CloseAccountInfo:
      return 'bucket'; // @ios: transactionCloseAccount
    case TransferInfo:
      switch ((transaction.info as TransferInfo).transferType) {
        case TransferType.send:
          return 'top'; // @ios: transactionSend
        case TransferType.receive:
          return 'bottom'; // @ios: transactionReceive
        default:
          break;
      }
      break;
    case SwapInfo:
      // TODO: on web doesn't have this icon
      return 'swap'; // @ios: transactionSwap
    default:
      break;
  }

  return 'db'; // @ios: transactionUndefined
}
