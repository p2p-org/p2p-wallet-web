import type { u64 } from '@solana/spl-token';
import type { PublicKey } from '@solana/web3.js';

import type { TokenValue } from 'new/sdk/OrcaSwap';
import type { Lamports } from 'new/sdk/SolanaSDK';
import { AccountInstructions } from 'new/sdk/SolanaSDK';
import { toLamport } from 'new/sdk/SolanaSDK/extensions/NumberExtensions';

import type { OrcaSwapSolanaClient } from '../apiClient/OrcaSwapSolanaClient';
import { InterTokenInfo } from './InterTokenInfo';
import { OrcaSwapError } from './OrcaSwapError';
import type { Pool } from './Pool';

export type Pools = Map<string, Pool>;
export type PoolsPair = Pool[];

/// Pools

// PoolsPair
export async function constructExchange({
  pools,
  tokens,
  solanaClient,
  owner,
  fromTokenPubkey,
  intermediaryTokenAddress,
  toTokenPubkey,
  amount,
  slippage,
  feePayer,
  minRentExemption,
}: {
  pools: PoolsPair;
  tokens: Map<string, TokenValue>;
  solanaClient: OrcaSwapSolanaClient;
  owner: PublicKey;
  fromTokenPubkey: string;
  intermediaryTokenAddress?: string;
  toTokenPubkey?: string;
  amount: u64;
  slippage: number;
  feePayer?: PublicKey | null;
  minRentExemption: u64;
}): Promise<[AccountInstructions, Lamports /*account creation fee*/]> {
  if (!pools.length || pools.length > 2) {
    throw OrcaSwapError.invalidPool();
  }

  if (pools.length === 1) {
    // direct swap
    return pools[0]!.constructExchange({
      tokens,
      solanaClient,
      owner,
      fromTokenPubkey,
      intermediaryTokenAddress,
      toTokenPubkey,
      amount,
      slippage,
      feePayer,
      minRentExemption,
    });
  } else {
    // transitive swap
    if (!intermediaryTokenAddress) {
      throw OrcaSwapError.intermediaryTokenAddressNotFound();
    }

    // first construction
    const [pool0AccountInstructions, pool0AccountCreationFee] = await pools[0]!.constructExchange({
      tokens,
      solanaClient,
      owner,
      fromTokenPubkey,
      toTokenPubkey: intermediaryTokenAddress,
      amount,
      slippage,
      feePayer,
      minRentExemption,
    });

    /// TODO: its different from, please actual then changes https://github.dev/p2p-org/OrcaSwapSwift/blob/7877642f7d6fd3765eee0143c21f3f8a7b93fe13/Sources/OrcaSwapSwift/Models/Pools.swift#L49
    const minAmountOut = pools[0]!.getMinimumAmountOut(amount, slippage);
    if (!amount) {
      throw OrcaSwapError.unknown();
    }

    const [pool1AccountInstructions, pool1AccountCreationFee] = await pools[1]!.constructExchange({
      tokens,
      solanaClient,
      owner,
      fromTokenPubkey: intermediaryTokenAddress,
      toTokenPubkey,
      amount: minAmountOut,
      slippage,
      feePayer,
      minRentExemption,
    });

    return [
      new AccountInstructions({
        account: pool1AccountInstructions.account,
        instructions: pool0AccountInstructions.instructions.concat(
          pool1AccountInstructions.instructions,
        ),
        cleanupInstructions: pool0AccountInstructions.cleanupInstructions.concat(
          pool1AccountInstructions.cleanupInstructions,
        ),
        signers: pool0AccountInstructions.signers.concat(pool1AccountInstructions.signers),
      }),
      pool0AccountCreationFee.add(pool1AccountCreationFee),
    ];
  }
}

export function getOutputAmount(pools: PoolsPair, inputAmount: u64): u64 | null {
  if (!pools.length) {
    return null;
  }

  const pool0 = pools[0];

  let estimatedAmountOfPool0;
  try {
    estimatedAmountOfPool0 = pool0?.getOutputAmount(inputAmount);
  } catch {
    // ignore
  }
  if (!estimatedAmountOfPool0) {
    return null;
  }

  // direct
  if (pools.length === 1) {
    return estimatedAmountOfPool0;
  }
  // transitive
  else {
    const pool1 = pools[1];
    let estimatedAmountOfPool1;
    try {
      estimatedAmountOfPool1 = pool1?.getOutputAmount(estimatedAmountOfPool0);
    } catch {
      // ignore
    }
    if (!estimatedAmountOfPool1) {
      return null;
    }

    return estimatedAmountOfPool1;
  }
}

export function getInputAmount(pools: PoolsPair, estimatedAmount: u64): u64 | null {
  if (!pools.length) {
    return null;
  }
  const pool0 = pools[0];

  // direct
  if (pools.length === 1) {
    let inputAmount;
    try {
      inputAmount = pool0?.getInputAmount(estimatedAmount);
    } catch {
      // ignore
    }
    if (!inputAmount) {
      return null;
    }

    return inputAmount;
  }
  // transitive
  else {
    const pool1 = pools[1];
    let inputAmountOfPool1;
    try {
      inputAmountOfPool1 = pool1?.getInputAmount(estimatedAmount);
    } catch {
      // ignore
    }
    if (!inputAmountOfPool1) {
      return null;
    }
    let inputAmountOfPool0;
    try {
      inputAmountOfPool0 = pool0?.getInputAmount(inputAmountOfPool1);
    } catch {
      // ignore
    }
    if (!inputAmountOfPool0) {
      return null;
    }

    return inputAmountOfPool0;
  }
}

export function getInputAmountSlippage(
  pools: PoolsPair,
  minimumAmountOut: u64,
  slippage: number,
): u64 | null {
  if (pools.length === 0) {
    return null;
  }
  const pool0 = pools[0];

  //direct
  if (pools.length === 1) {
    let inputAmount;
    try {
      inputAmount = pool0?.getInputAmountSlippage(minimumAmountOut, slippage);
    } catch {
      // ignore
    }
    if (!inputAmount) {
      return null;
    }
    return inputAmount;
  }
  // transitive
  else {
    const pool1 = pools[1];
    let inputAmountPool1;
    try {
      inputAmountPool1 = pool1?.getInputAmountSlippage(minimumAmountOut, slippage);
    } catch {
      // ignore
    }
    if (!inputAmountPool1) {
      return null;
    }

    let inputAmountPool0;
    try {
      inputAmountPool0 = pool0?.getInputAmountSlippage(inputAmountPool1, slippage);
    } catch {
      // ignore
    }
    if (!inputAmountPool0) {
      return null;
    }
    return inputAmountPool0;
  }
}

export function getMinimumAmountOut(
  pools: PoolsPair,
  inputAmount: u64,
  slippage: number,
): u64 | null {
  if (pools.length === 0) {
    return null;
  }
  const pool0 = pools[0];

  //direct
  if (pools.length === 1) {
    let minimumAmountOut;
    try {
      minimumAmountOut = pool0?.getMinimumAmountOut(inputAmount, slippage);
    } catch {
      // ignore
    }
    if (!minimumAmountOut) {
      return null;
    }
    return minimumAmountOut;
  }
  // transitive
  else {
    let outputAmountOfPool0;
    try {
      outputAmountOfPool0 = pool0?.getOutputAmount(inputAmount);
    } catch {
      // ignore
    }
    if (!outputAmountOfPool0) {
      return null;
    }

    const pool1 = pools[1];
    let minimumAmountOut;
    try {
      minimumAmountOut = pool1?.getMinimumAmountOut(outputAmountOfPool0, slippage);
    } catch {
      // ignore
    }
    if (!minimumAmountOut) {
      return null;
    }
    return minimumAmountOut;
  }
}

export function getIntermediaryToken(
  pools: PoolsPair,
  inputAmount: u64,
  slippage: number,
): InterTokenInfo | null {
  if (pools.length <= 1) {
    return null;
  }

  const pool0 = pools[0]!;

  return new InterTokenInfo({
    tokenName: pool0.tokenBName.toString(),
    outputAmount: pool0.getOutputAmount(inputAmount),
    minAmountOut: pool0.getMinimumAmountOut(inputAmount, slippage),
    isStableSwap: pools[1]!.isStable === true,
  });
}

export function calculateLiquidityProviderFees(
  pools: PoolsPair,
  inputAmount: number,
  slippage: number,
): u64[] {
  if (!pools.length || pools.length <= 1) {
    return [];
  }

  const pool0 = pools[0];

  const sourceDecimals = pool0?.tokenABalance?.decimals;
  if (!sourceDecimals) {
    throw OrcaSwapError.unknown();
  }

  const inputAmount0 = toLamport(inputAmount, sourceDecimals);

  // 1 pool
  const result: u64[] = [];
  const fee0 = pool0.calculatingFees(inputAmount0);
  result.push(fee0);

  // 2 pool
  if (pools.length === 2) {
    const pool1 = pools[1]!;
    const inputAmount1 = pool0.getMinimumAmountOut(inputAmount0, slippage);
    if (inputAmount1) {
      const fee1 = pool1.calculatingFees(inputAmount1);
      result.push(fee1);
    }
  }

  return result;
}
