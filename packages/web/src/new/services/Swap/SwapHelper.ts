import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';

import type { PayingFee } from 'new/app/models/PayingFee';
import { FeeType } from 'new/app/models/PayingFee';
import type { Pool, PoolsPair } from 'new/sdk/OrcaSwap';
import { getInputAmount, getOutputAmount } from 'new/sdk/OrcaSwap';
import type { Token } from 'new/sdk/SolanaSDK';
import { convertToBalance } from 'new/sdk/SolanaSDK';

// Array PayingFee

/**
 Get current token, that will be used as fee paying.
 */
export function totalToken(fees: PayingFee[]): Token | null {
  return fees.find((fee) => fee.type === FeeType.transactionFee)?.token ?? null;
}

/**
 Get total fee amount in fee token.
 */
export function totalDecimal(fees: PayingFee[]): number {
  const _totalToken = totalToken(fees);
  if (_totalToken) {
    const totalFees = fees.filter(
      (fee) => fee.token.symbol === _totalToken.symbol ?? fee.type === FeeType.liquidityProviderFee,
    );
    const decimals = totalFees[0]?.token.decimals ?? 0;
    return convertToBalance(
      totalFees.reduce((acc, curr) => acc.add(curr.lamports), ZERO),
      decimals,
    );
  }
  return 0.0;
}

export function totalLamport(fees: PayingFee[]): u64 {
  const _totalToken = totalToken(fees);
  if (_totalToken) {
    const totalFees = fees.filter(
      (fee) => fee.token.symbol === _totalToken.symbol ?? fee.type === FeeType.liquidityProviderFee,
    );
    return totalFees.reduce((acc, curr) => acc.add(curr.lamports), ZERO);
  }
  return ZERO;
}

// Array PoolsPair

// Find best pool to swap from estimated amount
export function findBestPoolsPairForEstimatedAmount({
  estimatedAmount,
  poolsPairs,
}: {
  estimatedAmount: u64;
  poolsPairs: PoolsPair[];
}): PoolsPair | null {
  if (!poolsPairs.length) {
    return null;
  }

  let bestPools: Pool[] | null = null;
  let bestInputAmount: u64 = new u64(2).pow(new u64(64)).subn(1); // uin64.max;

  for (const pair of poolsPairs) {
    const inputAmount = getInputAmount(pair, estimatedAmount);
    if (!inputAmount) {
      continue;
    }

    if (inputAmount.lt(bestInputAmount)) {
      bestInputAmount = inputAmount;
      bestPools = pair;
    }
  }

  return bestPools;
}

// Find best pool to swap from input amount
export function findBestPoolsPairForInputAmount({
  inputAmount,
  poolsPairs,
}: {
  inputAmount: u64;
  poolsPairs: PoolsPair[];
}): PoolsPair | null {
  if (!poolsPairs.length) {
    return null;
  }

  let bestPools: PoolsPair | null = null;
  let bestEstimatedAmount: u64 = ZERO;

  for (const pair of poolsPairs) {
    const estimatedAmount = getOutputAmount(pair, inputAmount);
    if (!estimatedAmount) {
      continue;
    }

    if (estimatedAmount.gt(bestEstimatedAmount)) {
      bestEstimatedAmount = estimatedAmount;
      bestPools = pair;
    }
  }

  return bestPools;
}
