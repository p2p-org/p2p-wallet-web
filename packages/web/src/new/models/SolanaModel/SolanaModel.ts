import { Provider } from '@project-serum/anchor';
import { Connection } from '@solana/web3.js';
import { singleton } from 'tsyringe';

import { WalletModel } from 'new/models/WalletModel';
import { Defaults } from 'new/services/Defaults';

import { Model } from '../../core/models/Model';

@singleton()
export class SolanaModel extends Model {
  protected _provider: Provider | null = null;
  protected _connection: Connection | null = null;

  constructor(private _walletModel: WalletModel) {
    super();
  }

  protected onInitialize(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.setUpConnection();
    this.setUpProvider();
  }

  protected afterReactionsRemoved() {
    this._provider = null;
    this._connection = null;
  }

  protected setUpConnection() {
    this._connection = new Connection(Defaults.apiEndpoint.getURL());
  }

  protected setUpProvider() {
    const connection = this.connection;
    const solana = this._walletModel.signer;

    if (!solana) {
      throw new Error('~~~ No Signer object was provided');
    }
    this._provider = new Provider(connection, solana, Provider.defaultOptions());
  }

  get connection(): Connection {
    if (!this._connection) {
      this.setUpConnection();
    }

    return this._connection as Connection;
  }

  get provider(): Provider {
    if (!this._provider) {
      this.setUpProvider();
    }

    return this._provider as Provider;
  }
}
