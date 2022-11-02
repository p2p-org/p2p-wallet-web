import { MintLayout, u64 } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

export class MintInfo {
  mintAuthorityOption: number;
  private _mintAuthority: null | PublicKey;
  supply: u64;
  decimals: number;
  isInitialized: boolean;
  freezeAuthorityOption: number;
  private _freezeAuthority: null | PublicKey;

  static decode(data: Buffer) {
    return new MintInfo(data);
  }

  constructor(data: Buffer) {
    const accountInfo = MintLayout.decode(data);
    this.mintAuthorityOption = accountInfo.mintAuthorityOption;
    this._mintAuthority = accountInfo.mintAuthority
      ? new PublicKey(accountInfo.mintAuthority)
      : null;
    this.supply = u64.fromBuffer(accountInfo.supply);
    this.decimals = accountInfo.decimals;
    this.isInitialized = accountInfo.isInitialized;
    this.freezeAuthorityOption = accountInfo.freezeAuthorityOption;
    this._freezeAuthority = accountInfo.freezeAuthority
      ? new PublicKey(accountInfo.freezeAuthority)
      : null;

    if (this.mintAuthorityOption === 0) {
      this._mintAuthority = null;
    }

    if (this.freezeAuthorityOption === 0) {
      this._freezeAuthority = null;
    }
  }

  get mintAuthority() {
    return this._mintAuthority;
  }

  get freezeAuthority() {
    return this._freezeAuthority;
  }

  static span = MintLayout.span;
}
