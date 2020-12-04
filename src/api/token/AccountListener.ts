import { Connection } from '@solana/web3.js';
import EventEmitter from 'eventemitter3';

import { TokenAccount } from './TokenAccount';

export type AccountUpdateEvent = {
  tokenAccount: TokenAccount;
};

export const ACCOUNT_UPDATED_EVENT = 'accountUpdated';

export class AccountListener extends EventEmitter {
  private connection: Connection;

  constructor(connection: Connection) {
    super();
    this.connection = connection;
  }

  listenTo(tokenAccount: TokenAccount): void {
    this.connection.onAccountChange(tokenAccount.address, (accountInfo, context) => {
      console.log('Account Changed');
      console.log(accountInfo, context);

      const emittedEvent: AccountUpdateEvent = {
        tokenAccount,
      };
      this.emit(ACCOUNT_UPDATED_EVENT, emittedEvent);
    });
  }
}
