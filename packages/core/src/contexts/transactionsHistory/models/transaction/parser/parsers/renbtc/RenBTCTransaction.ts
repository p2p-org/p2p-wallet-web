import type { AbstractTransaction, TransactionDetails } from '../types';

export class RenBTCTransaction implements AbstractTransaction {
  constructor(
    public type: string,
    public icon: string,
    public isReceiver: boolean,
    public amount: string,
    public tokenAccountAddress: string,
  ) {}

  details(_sources?: string[]): TransactionDetails {
    return {
      type: this.type,
      icon: this.icon,
      isReceiver: true,
      amount: this.amount,
      tokenAccount: this.tokenAccountAddress,
    };
  }
}
