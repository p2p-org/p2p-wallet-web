// @TODO might not need this decorator
import type { Wallet } from '@project-serum/anchor';
import type { WalletName } from '@solana/wallet-adapter-base';
import { BaseMessageSignerWalletAdapter, WalletReadyState } from '@solana/wallet-adapter-base';
import type { PublicKey, Signer, Transaction } from '@solana/web3.js';

export interface Wallet {
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
  publicKey: PublicKey;
}

export class MnemonicAdapter extends BaseMessageSignerWalletAdapter {
  name = 'MnemonicWallet' as WalletName;
  icon = '';
  url = '';
  private _account: Signer | null = null;
  private _connecting = false;
  private _readyState = WalletReadyState.NotDetected;
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

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    return Promise.resolve(message);
  }

  async disconnect(): Promise<void> {
    return Promise.resolve();
  }

  get publicKey(): PublicKey | null {
    return this._account?.publicKey || null;
  }

  get connecting(): boolean {
    return this._connecting;
  }

  get readyState(): WalletReadyState {
    return this._readyState;
  }

  override async connect(signer?: Signer): Promise<void> {
    if (signer) {
      this._account = signer;
    }

    return Promise.resolve();
  }
}
