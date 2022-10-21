import { injectable } from 'tsyringe';

import { isDev } from 'config/constants';
import {
  keyForGatewayAddress,
  keyForProcessingTransactions,
  keyForSession,
  LockAndMintServicePersistentStore as LockAndMintServicePersistentStoreOriginal,
} from 'new/sdk/RenVM';

@injectable()
export class LockAndMintServicePersistentStore extends LockAndMintServicePersistentStoreOriginal {
  constructor() {
    super({
      userDefaultKeyForSession: keyForSession,
      userDefaultKeyForGatewayAddress: keyForGatewayAddress,
      userDefaultKeyForProcessingTransactions: keyForProcessingTransactions,
      showLog: isDev,
    });
  }
}
