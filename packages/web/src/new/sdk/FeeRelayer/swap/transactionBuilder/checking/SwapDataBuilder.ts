import { ZERO } from '@orca-so/sdk';
import type { u64 } from '@solana/spl-token';
import type { PublicKey } from '@solana/web3.js';
import { Account } from '@solana/web3.js';

import { FeeRelayerError } from 'new/sdk/FeeRelayer';
import type { FeeRelayerRelaySwapType } from 'new/sdk/FeeRelayer/relay';
import { getSwapData, TransitiveSwapData } from 'new/sdk/FeeRelayer/relay';
import type { PoolsPair } from 'new/sdk/OrcaSwap';

export interface SwapData {
  swapData: FeeRelayerRelaySwapType;
  transferAuthorityAccount: Account | null;
}

export function buildSwapData({
  userAccount,
  pools,
  inputAmount,
  minAmountOut,
  slippage,
  transitTokenMintPubkey = null,
  newTransferAuthority = false,
  needsCreateTransitTokenAccount,
}: {
  userAccount: PublicKey;
  pools: PoolsPair;
  inputAmount?: u64 | null;
  minAmountOut?: u64 | null;
  slippage: number;
  transitTokenMintPubkey?: PublicKey | null;
  newTransferAuthority?: boolean;
  needsCreateTransitTokenAccount: boolean;
}): SwapData {
  // preconditions
  if (pools.length === 0 || pools.length > 2) {
    throw FeeRelayerError.swapPoolsNotFound();
  }
  if (!inputAmount && !minAmountOut) {
    throw FeeRelayerError.invalidAmount();
  }

  // create transferAuthority
  const transferAuthority = new Account();

  // form topUp params
  if (pools.length === 1) {
    const pool = pools[0]!;

    const amountIn = inputAmount ?? pool.getInputAmountSlippage(minAmountOut!, slippage);
    const minAmountOutNew = minAmountOut ?? pool.getInputAmountSlippage(inputAmount!, slippage);
    if (!amountIn || !minAmountOutNew) {
      throw FeeRelayerError.invalidAmount();
    }

    const directSwapData = getSwapData({
      pool,
      transferAuthorityPubkey: newTransferAuthority ? transferAuthority.publicKey : userAccount,
      amountIn,
      minAmountOut: minAmountOutNew,
    });
    return {
      swapData: directSwapData,
      transferAuthorityAccount: newTransferAuthority ? transferAuthority : null,
    };
  } else {
    const firstPool = pools[0]!;
    const secondPool = pools[1]!;

    if (!transitTokenMintPubkey) {
      throw FeeRelayerError.transitTokenMintNotFound();
    }

    // if input amount is provided
    let firstPoolAmountIn = inputAmount;
    let secondPoolAmountIn: u64 | null = null;
    let secondPoolAmountOut = minAmountOut;

    if (inputAmount) {
      secondPoolAmountIn = firstPool.getMinimumAmountOut(inputAmount, slippage) ?? ZERO;
      secondPoolAmountOut = secondPool.getMinimumAmountOut(secondPoolAmountIn, slippage);
    } else if (minAmountOut) {
      secondPoolAmountIn = secondPool.getInputAmountSlippage(minAmountOut, slippage) ?? ZERO;
      firstPoolAmountIn = firstPool.getInputAmountSlippage(secondPoolAmountIn, slippage);
    }

    if (!firstPoolAmountIn || !secondPoolAmountIn || !secondPoolAmountOut) {
      throw FeeRelayerError.invalidAmount();
    }

    const transitiveSwapData = new TransitiveSwapData({
      from: getSwapData({
        pool: firstPool,
        transferAuthorityPubkey: newTransferAuthority ? transferAuthority.publicKey : userAccount,
        amountIn: firstPoolAmountIn,
        minAmountOut: secondPoolAmountIn,
      }),
      to: getSwapData({
        pool: secondPool,
        transferAuthorityPubkey: newTransferAuthority ? transferAuthority.publicKey : userAccount,
        amountIn: secondPoolAmountIn,
        minAmountOut: secondPoolAmountOut,
      }),
      transitTokenMintPubkey: transitTokenMintPubkey.toString(),
      needsCreateTransitTokenAccount,
    });
    return {
      swapData: transitiveSwapData,
      transferAuthorityAccount: newTransferAuthority ? transferAuthority : null,
    };
  }
}
