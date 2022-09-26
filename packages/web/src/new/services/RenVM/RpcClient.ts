import { injectable } from 'tsyringe';

import { Network, RpcClient as RpcClientOriginal } from 'new/sdk/RenVM';

import { Defaults } from '../Defaults';

@injectable()
export class RpcClient extends RpcClientOriginal {
  constructor() {
    super({
      network: Defaults.apiEndpoint.network === 'mainnet-beta' ? Network.mainnet : Network.testnet,
    });
  }
}
