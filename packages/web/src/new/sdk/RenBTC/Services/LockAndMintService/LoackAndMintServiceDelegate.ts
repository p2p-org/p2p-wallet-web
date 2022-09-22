import type { LockAndMintProcessingTx } from 'new/sdk/RenBTC/Actions/LockAndMint/LockAndMint.ProcessingTx';

export interface LockAndMintServiceDelegate {
  // MARK: - Loading
  /// Start loading
  lockAndMintServiceWillStartLoading: () => void;

  /// Loaded
  lockAndMintServiceLoaded: (gatewayAddress: string) => void;

  /// Stop loading with error
  lockAndMintServiceWithError: () => void;

  // MARK: - Transaction events

  /// Transactions updated
  lockAndMintServiceUpdated: (processingTransactions: LockAndMintProcessingTx[]) => void;
}
