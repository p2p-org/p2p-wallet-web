import { singleton } from 'tsyringe';

import { FeeRelayerRelaySolanaClient, SwapFeeRelayer } from 'new/sdk/FeeRelayer';
import { OrcaSwapService } from 'new/services/OrcaSwapService';
import { SolanaService } from 'new/services/SolanaService';

@singleton()
export class SwapRelayService extends SwapFeeRelayer {
  constructor(
    solanaAPIClient: SolanaService,
    feeRelayerRelaySolanaClient: FeeRelayerRelaySolanaClient,
    orcaSwap: OrcaSwapService,
  ) {
    super({
      owner: solanaAPIClient.provider.wallet.publicKey,
      solanaApiClient: feeRelayerRelaySolanaClient,
      orcaSwap,
    });
  }
}
