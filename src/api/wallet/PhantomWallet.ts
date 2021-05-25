import { PublicKey, Transaction } from '@solana/web3.js';

import { Wallet, WalletEvent } from './Wallet';

type PhantomEvent = 'disconnect' | 'connect';
type PhantomRequestMethod = 'connect' | 'disconnect' | 'signTransaction' | 'signAllTransactions';

interface PhantomProvider {
  publicKey: PublicKey;
  isConnected?: boolean;
  autoApprove?: boolean;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
  signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
  on: (event: PhantomEvent, handler: (args: any) => void) => void;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
  request: (method: PhantomRequestMethod, params: any) => Promise<any>;
}

export class PhantomtWallet extends Wallet {
  private provider: PhantomProvider;

  constructor(network: string) {
    super(network);

    let provider: PhantomProvider;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
    if ((window as any)?.solana?.isPhantom) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
      provider = (window as any).solana;
    } else {
      window.open('https://phantom.app/', '_blank');
      throw new Error('Please install Phantom wallet from Chrome');
    }

    // once the sollet wallet emits a connect or disconnect event, pass it on
    provider.on(WalletEvent.CONNECT, () => this.emit(WalletEvent.CONNECT));
    provider.on(WalletEvent.DISCONNECT, () => this.emit(WalletEvent.DISCONNECT));
    void provider.connect();

    this.provider = provider;
  }

  get pubkey(): PublicKey {
    return this.provider.publicKey;
  }

  disconnect(): void {
    void this.provider.disconnect();
  }

  signTransaction(transaction: Transaction): Promise<Transaction> {
    return this.provider.signTransaction(transaction);
  }
}
