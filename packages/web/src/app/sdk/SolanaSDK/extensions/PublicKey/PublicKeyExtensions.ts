/* eslint-disable @typescript-eslint/no-magic-numbers */
import { SYSTEM_PROGRAM_ID } from '@p2p-wallet-web/core';
import { ASSOCIATED_TOKEN_PROGRAM_ID, NATIVE_MINT, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';

export class SolanaSDKPublicKey {
  static tokenProgramId() {
    return TOKEN_PROGRAM_ID;
  }
  static sysvarRent() {
    return SYSVAR_RENT_PUBKEY;
  }
  static programId() {
    return SYSTEM_PROGRAM_ID;
  }
  static wrappedSOLMint() {
    return NATIVE_MINT;
  }
  static splAssociatedTokenAccountProgramId() {
    return ASSOCIATED_TOKEN_PROGRAM_ID;
  }

  static orcaSwapId(version = 2): PublicKey {
    switch (version) {
      case 2: {
        return new PublicKey('9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP');
      }
      default: {
        return new PublicKey('DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1');
      }
    }
  }
}
