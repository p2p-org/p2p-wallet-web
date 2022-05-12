import { u64 } from '@solana/spl-token';
import type * as SolanaSDK from 'new/app/sdk/SolanaSDK';
import { SolanaSDK as SolanaSDKClass } from 'new/app/sdk/SolanaSDK';

// FeeAPIClient

export interface FeeAPIClientType {
  getLamportsPerSignature(): Promise<SolanaSDK.Lamports>;
  getCreatingTokenAccountFee(): Promise<u64>;
}

export class FeeAPIClient extends SolanaSDKClass implements FeeAPIClientType {
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

export class FeeService implements FeeServiceType {
  apiClient: FeeAPIClient;

  constructor(apiClient: FeeAPIClient) {
    this.apiClient = apiClient;
  }

  load(): Promise<void> {
    return Promise.all([
      this.apiClient.getLamportsPerSignature(),
      this.apiClient.getCreatingTokenAccountFee(),
    ]).then(([lps, mbr]): void => {
      this.lamportsPerSignature = lps;
      this.minimumBalanceForRenExemption = mbr;
    });
  }

  lamportsPerSignature: SolanaSDK.Lamports | null = null;
  minimumBalanceForRenExemption: SolanaSDK.Lamports | null = null;
}
