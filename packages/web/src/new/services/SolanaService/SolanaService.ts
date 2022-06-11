import { singleton } from 'tsyringe';

import * as SolanaSDK from 'new/app/sdk/SolanaSDK';
import { SolanaModel } from 'new/models/Solana/SolanaModel';

@singleton()
export class SolanaService extends SolanaSDK.SolanaSDK {
  constructor(protected solanaModel: SolanaModel) {
    super({
      provider: solanaModel.provider,
      endpoint: SolanaSDK.APIEndpoint.defaultEndpoints[0]!,
    });
  }
}
