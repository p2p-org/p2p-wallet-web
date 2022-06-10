import type { PublicKey } from '@solana/web3.js';

export type DestinationAccount = {
  address: PublicKey;
  owner?: PublicKey;
  isNeedCreate?: boolean;
  symbol?: string;
};
