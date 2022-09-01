import type { PublicKey } from '@solana/web3.js';

// A basic class that represents SPL Token.
export class TokenAccount {
  // A address of spl token.
  address: PublicKey;
  // A mint address for spl token.
  mint: PublicKey;

  constructor({ address, mint }: { address: PublicKey; mint: PublicKey }) {
    this.address = address;
    this.mint = mint;
  }
}
