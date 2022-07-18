import { Provider } from '@project-serum/anchor';
import { Connection } from '@solana/web3.js';
import { get } from 'lodash';
import { singleton } from 'tsyringe';

import { Defaults } from 'new/services/Defaults';

import { Model } from '../../core/models/Model';

@singleton()
export class SolanaModel extends Model {
  protected _provider: Provider | null = null;
  protected _connection: Connection | null = null;

  constructor() {
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
    this._connection = new Connection(Defaults.apiEndPoint.getURL());
  }

  protected setUpProvider() {
    const conn = this.connection;
    const solana = get(window, 'solana');
    if (!solana) {
      throw new Error('~~~ No Solana Object found on window');
    }
    this._provider = new Provider(conn, solana, Provider.defaultOptions());
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
