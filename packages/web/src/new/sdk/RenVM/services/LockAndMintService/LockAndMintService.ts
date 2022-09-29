import type { u64 } from '@solana/spl-token';

import type { LockAndMintServiceDelegate } from './LockAndMintServiceDelegate';

/// Service that is responsible for LockAndMint action
export interface LockAndMintService {
  /// Is loading
  isLoading: boolean;

  /// Delegate
  delegate?: LockAndMintServiceDelegate;

  /// Resume the service
  resume(): Promise<void>;

  /// Create new session
  createSession(endAt?: Date): Promise<void>;

  /// expire session
  expireCurrentSession(): void;

  getFee(): Promise<u64>;
}
