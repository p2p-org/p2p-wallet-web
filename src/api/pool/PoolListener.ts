import { Connection } from '@solana/web3.js';
import EventEmitter from 'eventemitter3';

import { ACCOUNT_UPDATED_EVENT, AccountListener } from '../token/AccountListener';
import { Pool } from './Pool';

export type PoolUpdatedEvent = {
  pool: Pool;
};

export const POOL_UPDATED_EVENT = 'poolUpdated';

export class PoolListener extends EventEmitter {
  private connection: Connection;

  constructor(connection: Connection) {
    super();
    this.connection = connection;
  }

  listenTo(pool: Pool): void {
    const poolAccountListener = new AccountListener(this.connection);

    poolAccountListener.listenTo(pool.tokenA);

    poolAccountListener.on(ACCOUNT_UPDATED_EVENT, () => {
      const event: PoolUpdatedEvent = { pool };
      this.emit(POOL_UPDATED_EVENT, event);
    });
  }
}
