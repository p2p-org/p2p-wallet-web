import { PublicKey, TransactionSignature } from '@solana/web3.js';

import { Serializable } from 'utils/types';

export type SerializableTransaction = {
  signature: TransactionSignature;
};

export class Transaction implements Serializable<SerializableTransaction> {
  readonly signature: TransactionSignature;

  constructor(signature: TransactionSignature) {
    this.signature = signature;
  }

  toString(): string {
    return this.signature;
  }

  serialize(): SerializableTransaction {
    return {
      signature: this.signature,
    };
  }

  static from(serializableTransaction: SerializableTransaction): Transaction {
    return new Transaction(serializableTransaction.signature);
  }
}
