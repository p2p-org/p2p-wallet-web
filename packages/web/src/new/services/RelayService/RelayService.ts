import { singleton } from 'tsyringe';

import {
  FeeRelayer,
  FeeRelayerAPIClient,
  FeeRelayerRelaySolanaClient,
  StatsInfoDeviceType,
} from 'new/sdk/FeeRelayer';
import { OrcaSwapService } from 'new/services/OrcaSwapService';
import { SolanaService } from 'new/services/SolanaService';

@singleton()
export class RelayService extends FeeRelayer {
  constructor(
    orcaSwap: OrcaSwapService,
    solanaAPIClient: SolanaService,
    feeRelayerRelaySolanaClient: FeeRelayerRelaySolanaClient,
  ) {
    super({
      orcaSwap,
      owner: solanaAPIClient.provider.wallet.publicKey,
      solanaApiClient: feeRelayerRelaySolanaClient,
      feeRelayerAPIClient: new FeeRelayerAPIClient(),
      deviceType: StatsInfoDeviceType.web,
      buildNumber: '1', // TODO: pass build number from environment
    });
  }
}
