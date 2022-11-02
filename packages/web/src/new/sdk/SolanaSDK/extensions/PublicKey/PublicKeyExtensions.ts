import { ASSOCIATED_TOKEN_PROGRAM_ID, NATIVE_MINT, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  PublicKey,
  SystemProgram,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SYSVAR_RENT_PUBKEY,
} from '@solana/web3.js';

export class SolanaSDKPublicKey {
  static get tokenProgramId(): PublicKey {
    return TOKEN_PROGRAM_ID;
  }
  static get sysvarRent(): PublicKey {
    return SYSVAR_RENT_PUBKEY;
  }
  static get programId(): PublicKey {
    return SystemProgram.programId;
  }
  static get wrappedSOLMint(): PublicKey {
    return NATIVE_MINT;
  }
  static get splAssociatedTokenAccountProgramId(): PublicKey {
    return ASSOCIATED_TOKEN_PROGRAM_ID;
  }
  static get renBTCMint(): PublicKey {
    return new PublicKey('CDJWUqTcYTVAKXAVXoQZFes5JUFc7owSeq7eMQcDSbo5');
  }
  static get renBTCMintDevnet(): PublicKey {
    return new PublicKey('FsaLodPu4VmSwXGr3gWfwANe4vKf8XSZcCh1CEeJ3jpD');
  }

  static get sysvarInstruction(): PublicKey {
    return SYSVAR_INSTRUCTIONS_PUBKEY; // Sysvar1nstructions1111111111111111111111111
  }
  static get secp256k1ProgramId(): PublicKey {
    return new PublicKey('KeccakSecp256k11111111111111111111111111111');
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

  static get usdcMint(): PublicKey {
    return new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
  }
  static get usdtMint(): PublicKey {
    return new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB');
  }
  static get dexPID(): PublicKey {
    return new PublicKey('9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin');
  }
  static get serumSwapPID(): PublicKey {
    return new PublicKey('22Y43yTVxuUkoRKdm9thyRhQ3SdgQS7c7kB6UNCiaczD');
  }
  static isUsdx(pubkey: PublicKey): boolean {
    return pubkey.equals(this.usdcMint) || pubkey.equals(this.usdtMint);
  }
}
