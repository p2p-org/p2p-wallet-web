import { Account, PublicKey, Transaction } from '@solana/web3.js';
import nacl from 'tweetnacl';

import { Wallet, WalletEvent } from '../Wallet';
import { getAccountFromSeed } from './utils';

export type ManualUserData = {
  seed: string;
  password?: string;
  derivationPath: string;
};

export type ManualStoredData = {
  seed: string;
  derivationPath: string;
};

export type ManualWalletData = ManualUserData | ManualStoredData;

/**
 * Manual wallet implementation that uses a private key
 */
export class ManualWallet extends Wallet {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private account: Account;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private _publicKey: PublicKey;

  constructor(network: string, data: ManualWalletData) {
    super(network);

    void this.init(data);
  }

  init(data: ManualWalletData): void {
    if (!data.seed) {
      throw new Error('Wallet data must have seed');
    }

    if (!data.derivationPath) {
      throw new Error('Wallet data must have derivationPath');
    }

    try {
      const seed = Buffer.from(data.seed, 'hex');

      this.account = getAccountFromSeed(seed, 0, data.derivationPath);
      this._publicKey = this.account.publicKey;

      // can be too fast and handler will not be set
      setTimeout(() => {
        this.emit(WalletEvent.CONNECT);
      }, 0);
    } catch (error) {
      this.emit(WalletEvent.DISCONNECT, error);
      throw error;
    }
  }

  get pubkey(): PublicKey {
    return this._publicKey;
  }

  get publicKey(): PublicKey {
    return this._publicKey;
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
}
