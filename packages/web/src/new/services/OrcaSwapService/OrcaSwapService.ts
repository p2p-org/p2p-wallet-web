import { singleton } from 'tsyringe';

import { OrcaSwap, OrcaSwapAPIClient } from 'new/sdk/OrcaSwap';
import { Defaults } from 'new/services/Defaults';
import { SolanaService } from 'new/services/SolanaService';

@singleton()
export class OrcaSwapService extends OrcaSwap {
  constructor(solanaClient: SolanaService) {
    super({
      apiClient: new OrcaSwapAPIClient(Defaults.apiEndpoint.network),
      solanaClient,
    });
  }
}
