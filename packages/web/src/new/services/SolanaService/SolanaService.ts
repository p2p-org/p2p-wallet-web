import { singleton } from 'tsyringe';

import { SolanaModel } from 'new/models/SolanaModel/SolanaModel';
import * as SolanaSDK from 'new/sdk/SolanaSDK';

@singleton()
export class SolanaService extends SolanaSDK.SolanaSDK {
  constructor(protected solanaModel: SolanaModel) {
    super({
      provider: solanaModel.provider,
      endpoint: SolanaSDK.APIEndpoint.defaultEndpoints[0]!,
    });
  }
}
