/// Service that is responsible for LockAndMint action
import type { LockAndMintServiceDelegate } from './LoackAndMintServiceDelegate';

export interface LockAndMintService {
  /// Is loading
  isLoading: boolean;

  /// Delegate
  delegate?: LockAndMintServiceDelegate;

  /// Resume the service
  resume: () => Promise<void>;

  /// Create new session
  createSession: (endAt?: number) => Promise<void>;

  /// expire session
  expireCurrentSession: () => void;
}
