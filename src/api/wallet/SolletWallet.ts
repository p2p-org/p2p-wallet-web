import SolletWalletAdapter from '@project-serum/sol-wallet-adapter';
import { PublicKey, Transaction } from '@solana/web3.js';

import { Wallet, WalletEvent } from './Wallet';

export const DEFAULT_SOLLET_PROVIDER = 'https://www.sollet.io';

/**
 * Wallet implementation for the sollet.io wallet.
 * It opens a popup browser window that prompts a user
 * to create and connect a simple web wallet.
 */
export class SolletWallet extends Wallet {
  private provider: SolletWalletAdapter;

  constructor(endpoint: string, provider: string | unknown) {
    super(endpoint);

    if (typeof provider !== 'string' && !provider) {
      throw new Error('Please install and initialize Sollet wallet extension first');
    }

    this.provider = new SolletWalletAdapter(provider, endpoint);

    // once the sollet wallet emits a connect or disconnect event, pass it on
    this.provider.on(WalletEvent.CONNECT, () => this.emit(WalletEvent.CONNECT));
    this.provider.on(WalletEvent.DISCONNECT, () => this.emit(WalletEvent.DISCONNECT));

    void this.provider.connect();
  }

  get pubkey(): PublicKey {
    return this.provider.publicKey;
  }

  get publicKey(): PublicKey {
    return this.provider.publicKey;
  }

  disconnect(): void {
    this.provider.disconnect();
  }

  signTransaction(transaction: Transaction): Promise<Transaction> {
    return this.provider.signTransaction(transaction);
  }

  signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    return this.provider.signAllTransactions(transactions);
  }
}
