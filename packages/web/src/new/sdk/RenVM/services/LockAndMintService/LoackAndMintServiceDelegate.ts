import type { LockAndMintProcessingTx } from '../../actions/LockAndMint';

export interface LockAndMintServiceDelegate {
  // Loading

  /// Start loading
  lockAndMintServiceWillStartLoading: () => void;

  /// Loaded
  lockAndMintServiceLoaded: (gatewayAddress: string) => void;

  /// Stop loading with error
  lockAndMintServiceWithError: () => void;

  // Transaction events

  /// Transactions updated
  lockAndMintServiceUpdated: (processingTransactions: LockAndMintProcessingTx[]) => void;
}
