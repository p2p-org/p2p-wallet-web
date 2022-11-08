import type { PublicKey, Signer, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';

import { LogEvent, Logger, SolanaSDKError } from '../index';
import type { FeeAmount } from './FeeAmount';

export class PreparedTransaction {
  owner?: PublicKey;
  transaction: Transaction;
  signers: Signer[];
  expectedFee: FeeAmount;

  constructor({
    owner,
    transaction,
    signers,
    expectedFee,
  }: {
    owner?: PublicKey;
    transaction: Transaction;
    signers: Signer[];
    expectedFee: FeeAmount;
  }) {
    this.owner = owner;
    this.transaction = transaction;
    this.signers = signers;
    this.expectedFee = expectedFee;
  }

  sign() {
    if (this.signers.length > 0) {
      this.transaction.partialSign(...this.signers);
    }
  }

  serialize(): string {
    const transaction = this.transaction;
    const serializedTransaction = transaction.serialize().toString('base64');

    Logger.log(serializedTransaction, LogEvent.info);
    const decodedTransaction = transaction;
    Logger.log(decodedTransaction, LogEvent.info);

    return serializedTransaction;
  }

  findSignature(publicKey: PublicKey): string {
    const signature = this.transaction.signatures.find((sign) =>
      sign.publicKey.equals(publicKey),
    )?.signature;

    if (!signature) {
      console.error(publicKey.toString());
      throw SolanaSDKError.other('Signature not found');
    }

    return bs58.encode(signature);
  }

  clone(): PreparedTransaction {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}