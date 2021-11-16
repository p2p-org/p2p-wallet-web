import type { PublicKey, Transaction } from '@solana/web3.js';
import EventEmitter from 'eventemitter3';

export enum WalletEvent {
  // eslint-disable-next-line no-unused-vars
  CONNECT = 'connect',
  // eslint-disable-next-line no-unused-vars
  DISCONNECT = 'disconnect',
  // eslint-disable-next-line no-unused-vars
  SIGNED = 'signed',
  // eslint-disable-next-line no-unused-vars
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

  abstract get publicKey(): PublicKey;

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
  abstract signTransaction(transaction: Transaction): Promise<Transaction>;

  abstract signAllTransactions(transaction: Transaction[]): Promise<Transaction[]>;
}
