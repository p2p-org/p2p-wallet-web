import '@abraham/reflection';

import type {
  Adapter,
  MessageSignerWalletAdapter,
  SignerWalletAdapter,
} from '@solana/wallet-adapter-base';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import type { Transaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { autorun, computed, makeObservable, observable, runInAction } from 'mobx';
import { singleton } from 'tsyringe';

import { WalletAdaptorService } from 'new/services/WalletAdaptorService';

import { Model } from '../../core/models/Model';

@singleton()
export class WalletModel extends Model {
  name: string;
  publicKey: string;
  adaptors: Adapter[] = [];
  network: WalletAdapterNetwork;
  connected: boolean;
  selectedAdaptor: Adapter | null = null;

  constructor(protected walletAdaptorService: WalletAdaptorService) {
    super();
    this.name = '';
    this.network = WalletAdapterNetwork.Mainnet;
    this.publicKey = '';
    this.connected = false;

    makeObservable(this, {
      name: observable,
      publicKey: observable,
      network: observable,
      connected: observable,
      adaptors: observable,
      selectedAdaptor: observable,
      pubKey: computed,
    });

    this.onConnect = this.onConnect.bind(this);
    this.onDisconnect = this.onDisconnect.bind(this);
  }

  protected createReactions() {
    this.addReaction(
      autorun(() => {
        if (this.network) {
          this.setupAdaptors();
        }
      }),
    );
  }

  protected afterReactionsRemoved() {}

  protected onInitialize(): void {
    this.createReactions();
  }

  protected override onEnd() {
    this.adaptors.forEach((adapter) => {
      adapter.removeAllListeners('connect');
      adapter.removeAllListeners('disconnect');
    });
    super.onEnd();
  }

  protected async setupAdaptors() {
    const { network } = this;

    const originalAdaptors = this.walletAdaptorService.getAdaptors(network);

    const newAdaptors = await Promise.all(
      originalAdaptors.map(async (value) => await this.setUpAdaptor(value)),
    );

    runInAction(() => {
      this.adaptors = newAdaptors;
    });
  }

  protected async onConnect(adaptor: Adapter, publicKey: PublicKey) {
    await adaptor.connect();

    runInAction(() => {
      this.selectedAdaptor = adaptor;
      this.connected = this.selectedAdaptor.connected;
      this.name = adaptor.name;
      this.publicKey = publicKey.toBase58();
    });
  }

  protected async onDisconnect(adaptor: Adapter) {
    await adaptor.disconnect();

    runInAction(() => {
      this.connected = adaptor.connected;
      this.name = '';
      this.publicKey = '';
    });
  }

  protected async setUpAdaptor(adaptor: Adapter): Promise<Adapter> {
    adaptor.on('connect', async (publicKey: PublicKey) => {
      await this.onConnect(adaptor, publicKey);
    });
    adaptor.on('disconnect', async () => {
      await this.onDisconnect(adaptor);
    });
    if (adaptor.connected && adaptor.publicKey) {
      await this.onConnect(adaptor, adaptor.publicKey);
    }
    return adaptor;
  }

  get pubKey(): PublicKey {
    return new PublicKey(this.publicKey);
  }

  get signer(): SignerWalletAdapter {
    return this.selectedAdaptor as SignerWalletAdapter;
  }

  get messageSigner(): MessageSignerWalletAdapter {
    return this.selectedAdaptor as MessageSignerWalletAdapter;
  }

  signAllTransactions(transactions: Array<Transaction>): Promise<Array<Transaction>> {
    if (!this.selectedAdaptor) {
      throw new Error('Not connected to an adaptor');
    }

    return this.signer.signAllTransactions(transactions);
  }

  signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.selectedAdaptor) {
      throw new Error('Not connected to a wallet adaptor');
    }

    return this.signer.signTransaction(transaction);
  }
}
