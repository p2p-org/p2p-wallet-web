import { ZERO } from '@orca-so/sdk';
import type { u64 } from '@solana/spl-token';

import type { StatsInfoOperationType } from 'new/sdk/FeeRelayer';

export class FeeRelayerConfiguration {
  additionalPaybackFee: u64;

  operationType: StatsInfoOperationType;
  currency: string | null;

  constructor({
    additionalPaybackFee = ZERO,
    operationType,
    currency = null,
  }: {
    additionalPaybackFee?: u64;
    operationType: StatsInfoOperationType;
    currency?: string | null;
  }) {
    this.additionalPaybackFee = additionalPaybackFee;
    this.operationType = operationType;
    this.currency = currency;
  }
}

export class FeeRelayer {
  // Constants
  static feeRelayerUrl = 'https://solana-fee-relayer.wallet.p2p.org';
}
