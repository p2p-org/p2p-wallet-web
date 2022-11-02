import { u64 } from '@solana/spl-token';
import type {
  ParsedInnerInstruction,
  ParsedTransactionMeta,
  ParsedTransactionWithMeta,
  TokenAmount,
} from '@solana/web3.js';

import type { ConfirmedTransaction, ParsedInstruction } from './ConfirmedTransaction';

export type TransactionID = string;
export type Lamports = u64;

export type TransactionInfo = Omit<ParsedTransactionWithMeta, 'meta' | 'transaction'> & {
  meta?: TransactionMeta;
  transaction: ConfirmedTransaction;
};

export type TransactionMeta = Omit<ParsedTransactionMeta, 'innerInstructions'> & {
  innerInstructions: InnerInstruction[] | null;
};

export type InnerInstruction = Omit<ParsedInnerInstruction, 'instructions'> & {
  instructions: ParsedInstruction[];
};

export class TokenAccountBalance {
  uiAmount: number | null;
  amount: string;
  decimals?: number;
  uiAmountString?: string;

  constructor({ uiAmount, amount, decimals, uiAmountString }: TokenAmount) {
    this.uiAmount = uiAmount;
    this.amount = amount;
    this.decimals = decimals;
    this.uiAmountString = uiAmountString;
  }

  get amountInU64(): u64 {
    return new u64(this.amount);
  }
}
