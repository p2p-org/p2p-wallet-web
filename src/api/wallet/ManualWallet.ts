import { Account, PublicKey, Transaction } from '@solana/web3.js';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import nacl from 'tweetnacl';

import { Wallet, WalletEvent } from './Wallet';

export type ManualCredentialsData = {
  mnemonic: string;
  password?: string;
};

export type ManualSeedData = {
  seed: string;
};

export type ManualWalletData = ManualCredentialsData | ManualSeedData;

/**
 * Manual wallet implementation that uses a private key
 */
export class ManualWallet extends Wallet {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private account: Account;

  constructor(network: string, data?: ManualWalletData) {
    super(network);

    void this.init(data);
  }

  async init(data?: ManualWalletData): Promise<void> {
    if (!(<ManualCredentialsData>data).mnemonic && !(<ManualSeedData>data).seed) {
      throw new Error('Wallet data must have credentials');
    }

    try {
      const seed = (<ManualSeedData>data).seed
        ? Buffer.from((<ManualSeedData>data).seed)
        : await bip39.mnemonicToSeed((<ManualCredentialsData>data).mnemonic);
      localStorage.setItem('seed', JSON.stringify(seed));

      const derivedSeed = bip32.fromSeed(seed).derivePath(`m/501'/0'/0/0`).privateKey as Uint8Array;
      const keyPair = nacl.sign.keyPair.fromSeed(derivedSeed);

      this.account = new Account(keyPair.secretKey);

      // can be too fast and handler will not be set
      setTimeout(() => {
        this.emit(WalletEvent.CONNECT);
      }, 1000);
    } catch (error) {
      this.emit(WalletEvent.DISCONNECT, error);
    }
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
}
