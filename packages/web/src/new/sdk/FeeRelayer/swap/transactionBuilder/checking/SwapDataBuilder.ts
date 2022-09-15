import { ZERO } from '@orca-so/sdk';
import type { u64 } from '@solana/spl-token';
import type { PublicKey } from '@solana/web3.js';
import { Account } from '@solana/web3.js';

import type { Pool, PoolsPair } from 'new/sdk/OrcaSwap';

import { FeeRelayerError } from '../../../models';
import type { FeeRelayerRelaySwapType } from '../../../relay';
import { DirectSwapData, TransitiveSwapData } from '../../../relay';

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
    const minAmountOutNew = minAmountOut ?? pool.getMinimumAmountOut(inputAmount!, slippage);
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

// Pool extension

export function getSwapData({
  pool,
  transferAuthorityPubkey,
  amountIn,
  minAmountOut,
}: {
  pool: Pool;
  transferAuthorityPubkey: PublicKey;
  amountIn: u64;
  minAmountOut: u64;
}): DirectSwapData {
  return new DirectSwapData({
    programId: pool.swapProgramId.toString(),
    accountPubkey: pool.account,
    authorityPubkey: pool.authority,
    transferAuthorityPubkey: transferAuthorityPubkey.toString(),
    sourcePubkey: pool.tokenAccountA,
    destinationPubkey: pool.tokenAccountB,
    poolTokenMintPubkey: pool.poolTokenMint,
    poolFeeAccountPubkey: pool.feeAccount,
    amountIn,
    minimumAmountOut: minAmountOut,
  });
}
