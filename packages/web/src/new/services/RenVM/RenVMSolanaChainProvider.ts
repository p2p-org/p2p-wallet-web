import { injectable } from 'tsyringe';

import type { ChainProvider, RenVMChainType } from 'new/sdk/RenVM';
import { RenVMRpcClientType, SolanaChain } from 'new/sdk/RenVM';
import { SolanaService } from 'new/services/SolanaService';

// TODO: apiClient and blockchainClient
@injectable()
export class RenVMSolanaChainProvider implements ChainProvider {
  constructor(private _rpcClient: RenVMRpcClientType, private _apiClient: SolanaService) {}

  // Get authorized account from chain
  getAccount(): Promise<Uint8Array> {
    return Promise.resolve(this._apiClient.provider.wallet.publicKey.toBytes());
  }

  // Load chain
  async load(): Promise<RenVMChainType> {
    return SolanaChain.load({
      client: this._rpcClient,
      apiClient: this._apiClient,
    });
  }
}
