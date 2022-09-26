import { injectable } from 'tsyringe';

import { BurnAndReleasePersistentStore, keyForSubmitedBurnTransaction } from 'new/sdk/RenVM';

@injectable()
export class BurnAndReleasePersistentStoreService extends BurnAndReleasePersistentStore {
  constructor() {
    super({
      userDefaultKeyForSubmitedBurnTransactions: keyForSubmitedBurnTransaction,
    });
  }
}
