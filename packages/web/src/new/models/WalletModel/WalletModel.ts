import '@abraham/reflection';

import type { Adapter, MessageSignerWalletAdapter, WalletName } from '@solana/wallet-adapter-base';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletName } from '@solana/wallet-adapter-phantom';
import type { Transaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import { autorun, computed, makeObservable, observable, runInAction } from 'mobx';
import { singleton } from 'tsyringe';

import type { Wallet } from 'new/scenes/Main/Auth/MnemonicAdapter';
import { MnemonicAdapter, MnemonicAdapterName } from 'new/scenes/Main/Auth/MnemonicAdapter';
import type { ConnectConfig } from 'new/scenes/Main/Auth/typings';
import { WalletAdaptorService } from 'new/services/WalletAdaptorService';

import { Model } from '../../core/models/Model';

@singleton()
export class WalletModel extends Model {
  name: string;
  publicKey: string;
  adaptors: Adapter[] = [];
  network: WalletAdapterNetwork;
  connected: boolean;
  connecting: boolean;
  selectedAdaptor: Adapter | null = null;

  private _adaptors: Array<Adapter | MnemonicAdapter> | null = null;
  private static _previousAdaptorKey = 'previousAdaptor';
  private static _reloadableAdaptors = [PhantomWalletName];

  constructor(protected walletAdaptorService: WalletAdaptorService) {
    super();
    this.name = '';
    this.network = WalletAdapterNetwork.Mainnet;
    this.publicKey = '';
    this.connected = false;
    this.connecting = false;

    makeObservable(this, {
      name: observable,
      publicKey: observable,
      network: observable,
      connected: observable,
      connecting: observable,
      selectedAdaptor: observable,
      adaptors: observable,
      pubKey: computed,
      signer: computed,
    });

    this.onConnect = this.onConnect.bind(this);
    this.onDisconnect = this.onDisconnect.bind(this);
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

  async disconnect(): Promise<void> {
    localStorage.removeItem(WalletModel._previousAdaptorKey);

    await this.selectedAdaptor?.disconnect();
  }

  async connectAdaptor(adaptorName: string, config?: ConnectConfig): Promise<void> {
    this.setupAdaptors();

    const adaptors = this._getAdaptors();
    const chosenAdaptor = adaptors.find((adaptor) => adaptor.name === adaptorName);

    if (chosenAdaptor) {
      this.connecting = true;
      await chosenAdaptor.connect(config);
    }

    this._saveAdaptorName(adaptorName);
    this.connecting = false;
  }

  protected _saveAdaptorName(adaptorName: string): void {
    if (adaptorName !== MnemonicAdapterName) {
      localStorage.setItem(WalletModel._previousAdaptorKey, adaptorName);
    }
  }

  protected setUpAdaptor(adaptor: Adapter | MnemonicAdapter): Adapter {
    adaptor.on('connect', (publicKey: PublicKey) => {
      this.onConnect(adaptor, publicKey);
    });

    adaptor.on('disconnect', () => {
      this.onDisconnect(adaptor);
    });

    if (adaptor.connected && adaptor.publicKey) {
      this.onConnect(adaptor, adaptor.publicKey);
    }

    return adaptor;
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
    void this._restoreLocal();
  }

  protected override onEnd() {
    this.adaptors.forEach((adapter) => {
      adapter.removeAllListeners('connect');
      adapter.removeAllListeners('disconnect');
    });
    super.onEnd();
  }

  protected setupAdaptors() {
    const originalAdaptors = this._getAdaptors();

    const newAdaptors = originalAdaptors.map((value) => this.setUpAdaptor(value));

    runInAction(() => {
      this.adaptors = newAdaptors;
    });
  }

  protected onConnect(adaptor: Adapter, publicKey: PublicKey) {
    runInAction(() => {
      this.selectedAdaptor = adaptor;
      this.connected = this.selectedAdaptor.connected;
      this.name = adaptor.name;
      this.publicKey = publicKey.toBase58();
    });
  }

  protected onDisconnect(adaptor: Adapter) {
    runInAction(() => {
      this.connected = adaptor.connected;
      this.name = '';
      this.publicKey = '';
    });
  }

  get pubKey(): PublicKey {
    return new PublicKey(this.publicKey);
  }

  get signer(): Wallet {
    return this.selectedAdaptor as Wallet;
  }

  get messageSigner(): MessageSignerWalletAdapter {
    return this.selectedAdaptor as MessageSignerWalletAdapter;
  }

  private _getAdaptors() {
    if (!this._adaptors) {
      this._adaptors = this.walletAdaptorService.getAdaptors(this.network);
    }

    return this._adaptors;
  }

  private async _restoreLocal(): Promise<void> {
    const localSinger = MnemonicAdapter.getLocalSigner();

    if (localSinger) {
      return await this.connectAdaptor(MnemonicAdapterName, {
        type: 'recur',
        signer: localSinger,
      });
    }

    const localAdaptor = localStorage.getItem(WalletModel._previousAdaptorKey);
    const shouldAutoConnect =
      localAdaptor && WalletModel._reloadableAdaptors.includes(localAdaptor as WalletName);

    if (shouldAutoConnect) {
      await this.connectAdaptor(localAdaptor);
    }
  }
}
