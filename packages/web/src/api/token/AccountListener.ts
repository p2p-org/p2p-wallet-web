import type { Connection } from '@solana/web3.js';
import EventEmitter from 'eventemitter3';

import type { TokenAccount } from './TokenAccount';

export type AccountUpdateEvent = {
  tokenAccount: TokenAccount;
};

let accountChangeSubscriptionsIds: number[] = [];

export const ACCOUNT_UPDATED_EVENT = 'accountUpdated';

export class AccountListener extends EventEmitter {
  private _connection: Connection;

  constructor(connection: Connection) {
    super();
    this._connection = connection;
  }

  listenTo(tokenAccount: TokenAccount): void {
    const subscriptionId = this._connection.onAccountChange(
      tokenAccount.address,
      (accountInfo, context) => {
        console.log('Account Changed');
        console.log(accountInfo, context);

        const emittedEvent: AccountUpdateEvent = {
          tokenAccount,
        };
        this.emit(ACCOUNT_UPDATED_EVENT, emittedEvent);
      },
    );

    accountChangeSubscriptionsIds.push(subscriptionId);
  }

  override removeAllListeners(event?: EventEmitter.EventNames<string | symbol>): this {
    accountChangeSubscriptionsIds.map((subscriptionId) =>
      this._connection.removeAccountChangeListener(subscriptionId),
    );
    accountChangeSubscriptionsIds = [];

    return super.removeAllListeners(event);
  }
}
