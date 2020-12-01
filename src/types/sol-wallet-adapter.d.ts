// Typescript binding for the Sollet wallet adapter library
declare module '@project-serum/sol-wallet-adapter' {
  import { PublicKey, Transaction } from '@solana/web3.js';
  import EventEmitter from 'eventemitter3';

  class Wallet extends EventEmitter {
    constructor(providerUrl: string, network: string);
    connect(): Promise<void>;
    disconnect(): void;
    signTransaction(transaction: Transaction): Promise<Transaction>;
    publicKey: PublicKey;
  }

  export = Wallet;
}
