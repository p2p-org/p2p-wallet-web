import { injectable } from 'tsyringe';

import { isDev } from 'config/constants';
import { LockAndMintServiceImpl, MintToken, RenVMRpcClientType } from 'new/sdk/RenVM';

import { LockAndMintServicePersistentStore } from './LockAndMintServicePersistentStore';
import { RenVMSolanaChainProvider } from './RenVMSolanaChainProvider';

@injectable()
export class LockAndMintService extends LockAndMintServiceImpl {
  constructor(
    persistentStore: LockAndMintServicePersistentStore,
    chainProvider: RenVMSolanaChainProvider,
    rpcClient: RenVMRpcClientType,
  ) {
    super({
      persistentStore,
      chainProvider,
      rpcClient,
      mintToken: MintToken.bitcoin,
      showLog: isDev,
    });
  }
}
