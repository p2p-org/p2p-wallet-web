// @TODO might not need this decorator
import type { Wallet } from '@project-serum/anchor';
// import type { WalletReadyState } from '@solana/wallet-adapter-base';
import type { PublicKey, Signer, Transaction } from '@solana/web3.js';

export interface Wallet {
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
  publicKey: PublicKey;
}

export class MnemonicAdapter implements Wallet {
  private readonly _account: Signer;
  // private _readyState: WalletReadyState;
  readonly publicKey: PublicKey;

  constructor(account: Signer) {
    this._account = account;
    this.publicKey = account.publicKey;
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    transaction.partialSign(this._account);

    return Promise.resolve(transaction);
  }

  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    transactions.forEach((trx) => trx.partialSign(this._account));

    return Promise.resolve(transactions);
  }
}
