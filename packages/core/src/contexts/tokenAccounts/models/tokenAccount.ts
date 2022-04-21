import type { TokenAmount } from '@p2p-wallet-web/token-utils';
import type { PublicKey } from '@solana/web3.js';

/**
 * A token account that may or may not exist.
 */
export interface TokenAccount {
  key?: PublicKey;
  loading: boolean;
  balance?: TokenAmount;
  isInitialized?: boolean;
}
