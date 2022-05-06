import type { TokenAmount } from '@p2p-wallet-web/token-utils';
import type { PublicKey } from '@solana/web3.js';

/**
 * A token account that may or may not exist.
 */
export interface TokenAccount<Loaded extends boolean = boolean> {
  key: Loaded extends true ? PublicKey : undefined;
  loading: boolean;
  balance: Loaded extends true ? TokenAmount : undefined;
  isInitialized?: boolean;
}
