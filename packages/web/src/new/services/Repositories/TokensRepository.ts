import { singleton } from 'tsyringe';

import * as SolanaSDK from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';

@singleton()
export class TokensRepository extends SolanaSDK.TokensRepository {
  constructor() {
    super({
      endpoint: Defaults.apiEndpoint,
      cache: new SolanaSDK.InMemoryTokensRepositoryCache(),
    });
  }
}
