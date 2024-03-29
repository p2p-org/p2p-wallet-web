import type { u64 } from '@solana/spl-token';
import type { PublicKey } from '@solana/web3.js';

import type { UsageStatus } from '../models';
import type { RelayAccountStatus } from './helpers';

export class FeeRelayerContext {
  minimumTokenAccountBalance: u64;
  minimumRelayAccountBalance: u64;
  feePayerAddress: PublicKey;
  lamportsPerSignature: u64;
  relayAccountStatus: RelayAccountStatus;
  usageStatus: UsageStatus;

  constructor({
    minimumTokenAccountBalance,
    minimumRelayAccountBalance,
    feePayerAddress,
    lamportsPerSignature,
    relayAccountStatus,
    usageStatus,
  }: {
    minimumTokenAccountBalance: u64;
    minimumRelayAccountBalance: u64;
    feePayerAddress: PublicKey;
    lamportsPerSignature: u64;
    relayAccountStatus: RelayAccountStatus;
    usageStatus: UsageStatus;
  }) {
    this.minimumTokenAccountBalance = minimumTokenAccountBalance;
    this.minimumRelayAccountBalance = minimumRelayAccountBalance;
    this.feePayerAddress = feePayerAddress;
    this.lamportsPerSignature = lamportsPerSignature;
    this.relayAccountStatus = relayAccountStatus;
    this.usageStatus = usageStatus;
  }

  equals(rhs: FeeRelayerContext): boolean {
    if (!this.minimumTokenAccountBalance.eq(rhs.minimumTokenAccountBalance)) {
      return false;
    }
    if (!this.minimumRelayAccountBalance.eq(rhs.minimumRelayAccountBalance)) {
      return false;
    }
    if (this.feePayerAddress !== rhs.feePayerAddress) {
      return false;
    }
    if (!this.lamportsPerSignature.eq(rhs.lamportsPerSignature)) {
      return false;
    }
    if (!this.relayAccountStatus.equals(rhs.relayAccountStatus)) {
      return false;
    }
    return true;
  }

  // for debug
  toJSON() {
    return {
      minimumTokenAccountBalance: this.minimumTokenAccountBalance.toString(),
      minimumRelayAccountBalance: this.minimumRelayAccountBalance.toString(),
      feePayerAddress: this.feePayerAddress.toString(),
      lamportsPerSignature: this.lamportsPerSignature.toString(),
      relayAccountStatus: this.relayAccountStatus.toJSON(),
      usageStatus: this.usageStatus.toJSON(),
    };
  }
}
