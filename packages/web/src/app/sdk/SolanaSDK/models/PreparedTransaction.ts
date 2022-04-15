import type { PublicKey, Signer, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';

import type { FeeAmount } from './FeeAmount';

export class PreparedTransaction {
  transaction: Transaction;
  signers: Signer[];
  expectedFee: FeeAmount;

  constructor({
    transaction,
    signers,
    expectedFee,
  }: {
    transaction: Transaction;
    signers: Signer[];
    expectedFee: FeeAmount;
  }) {
    this.transaction = transaction;
    this.signers = signers;
    this.expectedFee = expectedFee;
  }

  serialize(): string {
    const transaction = this.transaction;
    const serializedTransaction = transaction.serialize().toString('base64');

    // TODO: find some logger package
    // if (debug)
    console.info(serializedTransaction);
    const decodedTransaction = JSON.stringify(transaction);
    console.info(decodedTransaction);
    //

    return serializedTransaction;
  }

  findSignature(publicKey: PublicKey): string {
    const signature = this.transaction.signatures.find((sign) =>
      sign.publicKey.equals(publicKey),
    )?.signature;

    if (!signature) {
      throw new Error('Signature not found');
    }

    return bs58.encode(signature);
  }
}
