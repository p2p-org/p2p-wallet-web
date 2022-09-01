import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';

export class OtherFee {
  amount: number;
  unit: string;

  constructor({ amount, unit }: { amount: number; unit: string }) {
    this.amount = amount;
    this.unit = unit;
  }
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
    this.transaction = new u64(transaction.toString());
    this.accountBalances = new u64(accountBalances.toString());
    this.deposit = new u64(deposit.toString());
    this.others = others;
  }

  get total(): u64 {
    return new u64(this.transaction.add(this.accountBalances).add(this.deposit).toString());
  }

  static zero(): FeeAmount {
    return new FeeAmount({ transaction: new u64(0), accountBalances: new u64(0) });
  }

  toJSON() {
    return {
      transaction: this.transaction.toNumber(),
      accountBalances: this.accountBalances.toNumber(),
      deposit: this.deposit.toNumber(),
      others: this.others,
      total: this.total.toNumber(),
    };
  }

  clone(): FeeAmount {
    // https://stackoverflow.com/a/44782052/1024097
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}
