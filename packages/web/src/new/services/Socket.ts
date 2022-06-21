import { u64 } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { computed, makeObservable } from 'mobx';
import { Lifecycle, scoped } from 'tsyringe';

import type { Lamports } from 'new/sdk/SolanaSDK';
import { AccountInfo } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';

export interface AccountsObservableEvent {
  pubkey: string;
  lamports: Lamports;
}

@scoped(Lifecycle.ContainerScoped)
export class AccountObservableService {
  private _connection: Connection;

  get isConnected(): boolean {
    // @ts-ignore
    return this._connection._rpcWebSocketConnected;
  }

  constructor() {
    this._connection = new Connection(Defaults.apiEndPoint.getURL(), {
      wsEndpoint: Defaults.apiEndPoint.socketUrl,
    });

    makeObservable(this, {
      isConnected: computed,
    });
  }

  subscribeAccountNotification(
    account: string,
    cb: (notification: AccountsObservableEvent) => void,
  ) {
    // TODO: maybe not subscribe if exists

    this._connection.onAccountChange(new PublicKey(account), (accountInfo) => {
      const pubkey = account;

      // Native Account
      if (!accountInfo.data.length) {
        const lamports = new u64(accountInfo.lamports);
        cb({ pubkey, lamports });
      }
      // Token Account
      else {
        const info = AccountInfo.decode(accountInfo.data);
        const lamports = info.amount;
        cb({ pubkey, lamports });
      }
    });
  }
}
