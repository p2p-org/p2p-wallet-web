import { PublicKey, Transaction } from '@solana/web3.js';
import EventEmitter from 'eventemitter3';

// eslint-disable-next-line no-shadow
export enum WalletEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  SIGNED = 'signed',
  CONFIRMED = 'confirmed',
}

/**
 * Abstract wallet implementation. Any wallet connection,
 * e.g. browser extension, hardware wallet, web wallet etc,
 * is a separate implementation of this.
 */
export abstract class Wallet extends EventEmitter {
  private endpoint: string;

  protected constructor(network: string) {
    super();
    this.endpoint = network;
  }

  abstract get pubkey(): PublicKey;

  get publicKey(): PublicKey {
    return this.pubkey;
  }

  abstract disconnect(): void;

  /**
   * Sign the transaction, and emit a "signed" event
   * @param transaction
   */
  async sign(transaction: Transaction): Promise<Transaction> {
    const signedTransaction = await this.signTransaction(transaction);
    this.emit(WalletEvent.SIGNED, { transaction: signedTransaction });

    return signedTransaction;
  }

  /**
   * Delegate to the underlying implementation to sign the transaction
   * @param transaction
   * @protected
   */
  protected abstract signTransaction(transaction: Transaction): Promise<Transaction>;

  protected abstract signAllTransactions(transaction: Transaction[]): Promise<Transaction[]>;
}
