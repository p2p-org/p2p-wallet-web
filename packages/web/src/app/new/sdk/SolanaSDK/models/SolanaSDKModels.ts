import { u64 } from '@solana/spl-token';
import type { TokenAmount } from '@solana/web3.js';

export type Lamports = u64;

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
