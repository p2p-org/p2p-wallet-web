import { u64 } from '@solana/spl-token';
import { injectable } from 'tsyringe';

import { SolanaModel } from 'new/models/SolanaModel';
import type * as SolanaSDK from 'new/sdk/SolanaSDK';
import { SolanaSDK as SolanaSDKClass } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';

// FeeAPIClient

export interface FeeAPIClientType {
  getLamportsPerSignature(): Promise<SolanaSDK.Lamports>;
  getCreatingTokenAccountFee(): Promise<u64>;
}

// TODO: dont use all sdk
@injectable()
export class FeeAPIClient extends SolanaSDKClass implements FeeAPIClientType {
  constructor(protected solanaModel: SolanaModel) {
    super({
      provider: solanaModel.provider,
      endpoint: Defaults.apiEndpoint,
    });
  }

  getLamportsPerSignature(): Promise<SolanaSDK.Lamports> {
    return this.provider.connection.getRecentBlockhash().then((result) => {
      return new u64(result.feeCalculator.lamportsPerSignature);
    });
  }
}

// FeeService

export interface FeeServiceType {
  readonly apiClient: FeeAPIClient;
  lamportsPerSignature: SolanaSDK.Lamports | null;
  minimumBalanceForRenExemption: SolanaSDK.Lamports | null;
  load(): Promise<void>;
}

@injectable()
export class FeeService implements FeeServiceType {
  lamportsPerSignature: SolanaSDK.Lamports | null = null;
  minimumBalanceForRenExemption: SolanaSDK.Lamports | null = null;

  constructor(readonly apiClient: FeeAPIClient) {}

  load(): Promise<void> {
    return Promise.all([
      this.apiClient.getLamportsPerSignature(),
      this.apiClient.getCreatingTokenAccountFee(),
    ]).then(([lps, mbr]): void => {
      this.lamportsPerSignature = lps;
      this.minimumBalanceForRenExemption = mbr;
    });
  }
}
