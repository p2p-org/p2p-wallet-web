import type { PublicKey } from '@solana/web3.js';

export type TokenAccountInfo = {
  pubkey: PublicKey;
  mintAddress: string;
  owner: PublicKey;
  tokenAmount: number;
  delegate?: PublicKey;
};
