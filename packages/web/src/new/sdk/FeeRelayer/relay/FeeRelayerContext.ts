import type { u64 } from '@solana/spl-token';
import type { PublicKey } from '@solana/web3.js';

import type { UsageStatus } from 'new/sdk/FeeRelayer';
import type { RelayAccountStatus } from 'new/sdk/FeeRelayer/relay/helpers';

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
}
