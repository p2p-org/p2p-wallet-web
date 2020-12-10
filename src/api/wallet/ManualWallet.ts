import { Account, PublicKey, Transaction } from '@solana/web3.js';
import * as bip32 from 'bip32';
import * as bip39 from 'bip39';
import nacl from 'tweetnacl';

import { Wallet, WalletEvent } from './Wallet';

export type ManualWalletData = {
  mnemonic: string;
  password: string;
};

/**
 * Manual wallet implementation that uses a private key
 */
export class ManualWallet extends Wallet {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private account: Account;

  constructor(network: string, data?: ManualWalletData) {
    super(network);

    if (!data) {
      throw new Error('Must have mnemonic');
    }

    bip39
      .mnemonicToSeed(data.mnemonic)
      // eslint-disable-next-line promise/always-return
      .then((seed) => {
        const derivedSeed = bip32.fromSeed(seed).derivePath(`m/501'/0'/0/0`).privateKey;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const keyPair = nacl.sign.keyPair.fromSeed(derivedSeed);

        this.account = new Account(keyPair.secretKey);

        this.emit(WalletEvent.CONNECT);
      })
      .catch(() => {
        this.emit(WalletEvent.DISCONNECT);
      });
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
