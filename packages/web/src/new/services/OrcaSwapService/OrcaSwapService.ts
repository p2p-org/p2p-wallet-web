import { singleton } from 'tsyringe';

import { APIClient, NetworkConfigsProvider, OrcaSwap } from 'new/sdk/OrcaSwap';
import { Defaults } from 'new/services/Defaults';
import { SolanaService } from 'new/services/SolanaService';

@singleton()
export class OrcaSwapService extends OrcaSwap {
  constructor(solanaClient: SolanaService) {
    super({
      apiClient: new APIClient(new NetworkConfigsProvider(Defaults.apiEndpoint.network)),
      solanaClient,
    });
  }
}
