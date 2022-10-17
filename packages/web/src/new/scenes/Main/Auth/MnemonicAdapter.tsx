// @TODO might not need this decorator
import type { Wallet } from '@project-serum/anchor';
import { BaseMessageSignerWalletAdapter } from '@solana/wallet-adapter-base';
import type { PublicKey, Signer, Transaction } from '@solana/web3.js';

export interface Wallet {
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
  publicKey: PublicKey;
}

export class MnemonicAdapter extends BaseMessageSignerWalletAdapter {
  private _account: Signer | null = null;
  private static _noKeypairError = 'No keypair to sign transactions';

  constructor() {
    super();
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (this._account) {
      transaction.partialSign(this._account);

      return Promise.resolve(transaction);
    }

    return Promise.reject(MnemonicAdapter._noKeypairError);
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    if (this._account) {
      transactions.forEach((trx) => trx.partialSign(this._account as Signer));

      return Promise.resolve(transactions);
    }

    return Promise.reject(MnemonicAdapter._noKeypairError);
  }

  get pubKey() {
    return this._account?.publicKey;
  }

  set signer(signer: Signer) {
    this._account = signer;
    this.publicKey = signer.publicKey;
  }

  // add connect
}
