import type { u64 } from '@solana/spl-token';

export class UsageStatus {
  maxUsage: number;
  currentUsage: number;
  maxAmount: u64;
  amountUsed: u64;

  constructor({
    maxUsage,
    currentUsage,
    maxAmount,
    amountUsed,
  }: {
    maxUsage: number;
    currentUsage: number;
    maxAmount: u64;
    amountUsed: u64;
  }) {
    this.maxUsage = maxUsage;
    this.currentUsage = currentUsage;
    this.maxAmount = maxAmount;
    this.amountUsed = amountUsed;
  }

  isFreeTransactionFeeAvailable({
    transactionFee,
    forNextTransaction = false,
  }: {
    transactionFee: u64;
    forNextTransaction?: boolean;
  }): boolean {
    let currentUsage = this.currentUsage;
    if (forNextTransaction) {
      currentUsage += 1;
    }

    return currentUsage < this.maxUsage && this.amountUsed.add(transactionFee).lte(this.maxAmount);
  }
}
