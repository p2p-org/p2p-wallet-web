import { TokenAmount } from '@p2p-wallet-web/token-utils';
import type { Token } from '@saberhq/token-utils';
import { WRAPPED_SOL } from '@saberhq/token-utils';
import type { u64 } from '@solana/spl-token';

export class Wallet {
  // Properties
  pubkey: string | null;
  lamports: u64 | null;
  token: Token;
  userInfo: any;

  get isNativeSOL(): boolean {
    // return this.token.isRawSOL;
    return this.token.isRawSOL;
  }

  constructor(pubkey: string | null = null, lamports: u64 | null = null, token: Token) {
    this.pubkey = pubkey;
    this.lamports = lamports;
    this.token = token;
  }

  // Computed properties
  get amount(): number | null {
    // return this.lamports?.
    if (!this.lamports) {
      return null;
    }

    return new TokenAmount(this.token, this.lamports).asNumber;
  }

  // Fabric methods
  static nativeSolana(pubkey?: string | null, lamports?: u64): Wallet {
    return new Wallet(pubkey, lamports, WRAPPED_SOL['mainnet-beta']);
  }
}
