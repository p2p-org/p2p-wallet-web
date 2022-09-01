import { ZERO } from '@orca-so/sdk';
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

  private _accountSubscriptions: Record<string, number> = {};

  get isConnected(): boolean {
    // @ts-ignore
    return this._connection._rpcWebSocketConnected;
  }

  constructor() {
    this._connection = new Connection(Defaults.apiEndpoint.getURL(), {
      wsEndpoint: Defaults.apiEndpoint.socketUrl,
    });

    makeObservable(this, {
      isConnected: computed,
    });
  }

  subscribeAccountNotification(
    account: string,
    cb: (notification: AccountsObservableEvent) => void,
  ): number {
    if (this._accountSubscriptions[account]) {
      return this._accountSubscriptions[account]!;
    }

    const subscriptionId = this._connection.onAccountChange(
      new PublicKey(account),
      (accountInfo) => {
        const pubkey = account;

        // Native Account
        if (!accountInfo.data.length) {
          const lamports = new u64(accountInfo.lamports);
          cb({ pubkey, lamports });
        }
        // Token Account
        else {
          const info = AccountInfo.decode(accountInfo.data);
          const lamports = info?.amount ?? ZERO; // TODO: check it works right
          cb({ pubkey, lamports });
        }
      },
    );

    this._accountSubscriptions[account] = subscriptionId;

    return subscriptionId;
  }
}
