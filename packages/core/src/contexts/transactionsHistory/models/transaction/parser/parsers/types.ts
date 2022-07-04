import type {
  CloseAccountTransaction,
  CreateAccountTransaction,
  ParsedConfirmedTransaction,
  ParsedInstruction,
  SwapTransaction,
  TransferTransaction,
  RenBTCTransaction,
} from '../../../../index';

export type CustomParsedTransaction =
  | SwapTransaction
  | CreateAccountTransaction
  | CloseAccountTransaction
  | TransferTransaction
  | RenBTCTransaction
  | null;

// additional properties if you want to show spend amount
export type TransactionAmountDetails = {
  amount?: string;
  tokenAccount?: string;
};

export type TransactionDetails = TransactionAmountDetails & {
  type: string;
  icon: string;
  isReceiver?: boolean;
};

export abstract class AbstractTransaction {
  abstract details(string?: string[]): TransactionDetails;
}

export abstract class Parser {
  // @ts-ignore
  static can(instructions: ParsedInstruction[]): boolean;
  // @ts-ignore
  static parse<T>(transactionInfo: ParsedConfirmedTransaction): T;
}
