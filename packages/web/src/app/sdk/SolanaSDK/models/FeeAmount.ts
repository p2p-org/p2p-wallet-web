import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';

class OtherFee {
  constructor(public amount: number, public unit: string) {}
}

export class FeeAmount {
  transaction: u64;
  accountBalances: u64;
  deposit: u64 = ZERO;
  others?: OtherFee[];

  constructor({
    transaction,
    accountBalances,
    deposit = ZERO,
    others,
  }: {
    transaction: u64;
    accountBalances: u64;
    deposit?: u64;
    others?: OtherFee[];
  }) {
    this.transaction = transaction;
    this.accountBalances = accountBalances;
    this.deposit = deposit;
    this.others = others;
  }

  get total(): u64 {
    return this.transaction.add(this.accountBalances).add(this.deposit);
  }

  static zero(): FeeAmount {
    return new FeeAmount({ transaction: new u64(0), accountBalances: new u64(0) });
  }
}
