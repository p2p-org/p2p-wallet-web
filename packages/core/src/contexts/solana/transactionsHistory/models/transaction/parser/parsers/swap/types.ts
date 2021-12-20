import type { AbstractTransaction, TransactionDetails } from '../types';

export class SwapTransaction implements AbstractTransaction {
  constructor(
    public source?: string,
    public sourceAmount?: string,
    public destination?: string,
    public destinationAmount?: string,
  ) {}

  details(source?: string): TransactionDetails {
    const isReceiver = this.destination === source;
    return {
      type: 'swap',
      icon: 'swap',
      isReceiver,

      amount: isReceiver ? this.destinationAmount : this.sourceAmount,
      tokenAccount: isReceiver ? this.destination : this.source,
    };
  }
}
