import { injectable } from 'tsyringe';

import { BurnAndReleaseServiceImpl, DestinationChain } from 'new/sdk/RenVM';
import { BurnAndReleasePersistentStoreService } from 'new/services/RenVM/BurnAndReleaseServicePersistentStore';
import { RenVMSolanaChainProvider } from 'new/services/RenVM/RenVMSolanaChainProvider';
import { RpcClient } from 'new/services/RenVM/RpcClient';

@injectable()
export class BurnAndReleaseService extends BurnAndReleaseServiceImpl {
  constructor(
    rpcClient: RpcClient,
    chainProvider: RenVMSolanaChainProvider,
    persistentStore: BurnAndReleasePersistentStoreService,
  ) {
    super({
      rpcClient,
      chainProvider,
      destinationChain: DestinationChain.bitcoin,
      persistentStore,
      version: '1',
    });
  }
}
