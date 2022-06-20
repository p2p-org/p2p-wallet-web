import { u64 } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { computed, makeObservable } from 'mobx';
import { Lifecycle, scoped } from 'tsyringe';

import type { Lamports } from 'new/app/sdk/SolanaSDK';
import { AccountInfo } from 'new/app/sdk/SolanaSDK';
import { DI_KEYS } from 'new/core/Constants';
import { DependencyService } from 'new/services/injection/DependencyContext';

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
    const rpcHost: string = DependencyService.resolve(DI_KEYS.SOLANA_RPC_HOST);
    if (!rpcHost) {
      throw new Error('~~~ No RPC Host provided by ENV');
    }

    this._connection = new Connection(rpcHost);

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
