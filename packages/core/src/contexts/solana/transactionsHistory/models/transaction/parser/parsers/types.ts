import type {
  CloseAccountTransaction,
  CreateAccountTransaction,
  ParsedConfirmedTransaction,
  ParsedInstruction,
  SwapTransaction,
  TransferTransaction,
} from '../../../../index';

export type CustomParsedTransaction =
  | SwapTransaction
  | CreateAccountTransaction
  | CloseAccountTransaction
  | TransferTransaction
  | null;

export type TransactionDetails = {
  type: string;
  icon: string;
  isReceiver?: boolean;

  amount?: string;
  tokenAccount?: string;
};

export abstract class AbstractTransaction {
  abstract details(string?: string): TransactionDetails;
}

export abstract class Parser {
  // @ts-ignore
  static can(instructions: ParsedInstruction[]): boolean;
  // @ts-ignore
  static parse<T>(transactionInfo: ParsedConfirmedTransaction): T;
}
