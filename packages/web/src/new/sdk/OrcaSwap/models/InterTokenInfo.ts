import type { u64 } from '@solana/spl-token';

export class InterTokenInfo {
  tokenName: string;
  outputAmount?: u64;
  minAmountOut?: u64;
  isStableSwap: boolean;

  constructor({
    tokenName,
    outputAmount,
    minAmountOut,
    isStableSwap,
  }: {
    tokenName: string;
    outputAmount?: u64;
    minAmountOut?: u64;
    isStableSwap: boolean;
  }) {
    this.tokenName = tokenName;
    this.outputAmount = outputAmount;
    this.minAmountOut = minAmountOut;
    this.isStableSwap = isStableSwap;
  }
}
