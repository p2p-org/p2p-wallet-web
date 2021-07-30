import { Account, PublicKey, Transaction } from '@solana/web3.js';
import nacl from 'tweetnacl';

import { isDev, localPrivateKey } from 'config/constants';

import { Wallet, WalletEvent } from './Wallet';

/**
 * Test wallet implementation that uses a private key
 */
export class LocalWallet extends Wallet {
  private account: Account;

  constructor(endpoint: string) {
    super(endpoint);
    if (!isDev) {
      throw new Error('LocalWallet can not be used in production');
    }

    if (!localPrivateKey) {
      throw new Error('No local private key in the environment');
    }

    this.account = new Account(JSON.parse(localPrivateKey));

    // simulate connecting to an external wallet;
    setImmediate(() => this.emit(WalletEvent.CONNECT));
  }

  get pubkey(): PublicKey {
    return this.account.publicKey;
  }

  // eslint-disable-next-line class-methods-use-this
  disconnect(): void {
    // Nothing to do here
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    const message = transaction.serializeMessage();
    const signature = nacl.sign.detached(message, this.account.secretKey);
    transaction.addSignature(this.account.publicKey, Buffer.from(signature));
    return Promise.resolve(transaction);
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    for (const transaction of transactions) {
      const message = transaction.serializeMessage();
      const signature = nacl.sign.detached(message, this.account.secretKey);
      transaction.addSignature(this.account.publicKey, Buffer.from(signature));
    }
    return Promise.resolve(transactions);
  }
}
