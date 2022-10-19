import { singleton } from 'tsyringe';

import { isDev } from 'config/constants';
import { LockAndMintServiceImpl, MintToken } from 'new/sdk/RenVM';
import { NotificationService } from 'new/services/NotificationService';
import { RpcClient } from 'new/services/RenVM/RpcClient';
import { notifyTransactionIsWaitingForMint } from 'new/services/RenVM/utils/notifyTransactionIsWaitingForMint';

import { LockAndMintServicePersistentStore } from './LockAndMintServicePersistentStore';
import { RenVMSolanaChainProvider } from './RenVMSolanaChainProvider';

@singleton()
export class LockAndMintService extends LockAndMintServiceImpl {
  constructor(
    persistentStore: LockAndMintServicePersistentStore,
    chainProvider: RenVMSolanaChainProvider,
    rpcClient: RpcClient,
    private _notificationService: NotificationService,
  ) {
    super({
      persistentStore,
      chainProvider,
      rpcClient,
      mintToken: MintToken.bitcoin,
      showLog: isDev,
      txSubmittedCallback: (tx) => {
        notifyTransactionIsWaitingForMint(tx, this._notificationService);
      },
    });
  }
}
