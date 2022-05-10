/* eslint-disable @typescript-eslint/no-magic-numbers */
import { u64 } from '@solana/spl-token';
import { AccountLayout } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

export class AccountInfo {
  mint: PublicKey;
  owner: PublicKey;
  amount: u64;
  delegateOption: number;
  delegate?: PublicKey;
  state: number;
  isNativeOption: number;
  isNativeRaw: u64;
  delegatedAmount: u64;
  closeAuthorityOption: number;
  closeAuthority: PublicKey | null;

  static decode(data: Buffer) {
    return new AccountInfo(data);
  }

  constructor(data: Buffer) {
    const accountInfo = AccountLayout.decode(data);
    this.mint = new PublicKey(accountInfo.mint);
    this.owner = new PublicKey(accountInfo.owner);
    this.amount = u64.fromBuffer(accountInfo.amount);
    this.delegateOption = accountInfo.delegateOption;
    this.delegate = new PublicKey(accountInfo.delegate);
    this.state = accountInfo.state;
    this.isNativeOption = accountInfo.isNativeOption;
    this.isNativeRaw = accountInfo.isNativeRaw;
    this.delegatedAmount = new u64(accountInfo.delegatedAmount);
    this.closeAuthorityOption = accountInfo.closeAuthorityOption;
    this.closeAuthority = accountInfo.closeAuthority
      ? new PublicKey(accountInfo.closeAuthority)
      : null;
  }

  // non-parsing
  get isInitialized(): boolean {
    return this.state !== 0;
  }

  get isFrozen(): boolean {
    return this.state === 2;
  }

  get rentExemptReserve(): u64 | null {
    if (this.isNativeOption === 1) {
      return this.isNativeRaw;
    }
    return null;
  }

  get isNative(): boolean {
    return this.isNativeOption === 1;
  }

  static span = AccountLayout.span;
}
