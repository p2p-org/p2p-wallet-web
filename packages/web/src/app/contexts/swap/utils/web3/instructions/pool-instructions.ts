import type { u64 } from '@solana/spl-token';
import type { PublicKey } from '@solana/web3.js';
import { TransactionInstruction } from '@solana/web3.js';
import { Buffer } from 'buffer';
import * as BufferLayout from 'buffer-layout';

import * as Layout from './layout';

export function swapInstruction(
  tokenSwap: PublicKey,
  authority: PublicKey,
  userTransferAuthority: PublicKey,
  userSource: PublicKey,
  poolSource: PublicKey,
  poolDestination: PublicKey,
  userDestination: PublicKey,
  poolMint: PublicKey,
  feeAccount: PublicKey,
  hostFeeAccount: PublicKey | null,
  swapProgramId: PublicKey,
  tokenProgramId: PublicKey,
  amountIn: u64,
  minimumAmountOut: u64,
): TransactionInstruction {
  const dataLayout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    Layout.uint64('amountIn'),
    Layout.uint64('minimumAmountOut'),
  ]);

  const data = Buffer.alloc(dataLayout.span);

  dataLayout.encode(
    {
      instruction: 1, // Swap instruction
      amountIn: amountIn.toBuffer(),
      minimumAmountOut: minimumAmountOut.toBuffer(),
    },
    data,
  );

  const keys = [
    { pubkey: tokenSwap, isSigner: false, isWritable: false },
    { pubkey: authority, isSigner: false, isWritable: false },
    { pubkey: userTransferAuthority, isSigner: true, isWritable: false },
    { pubkey: userSource, isSigner: false, isWritable: true },
    { pubkey: poolSource, isSigner: false, isWritable: true },
    { pubkey: poolDestination, isSigner: false, isWritable: true },
    { pubkey: userDestination, isSigner: false, isWritable: true },
    { pubkey: poolMint, isSigner: false, isWritable: true },
    { pubkey: feeAccount, isSigner: false, isWritable: true },
    { pubkey: tokenProgramId, isSigner: false, isWritable: false },
  ];
  if (hostFeeAccount !== null) {
    keys.push({ pubkey: hostFeeAccount, isSigner: false, isWritable: true });
  }
  return new TransactionInstruction({
    keys,
    programId: swapProgramId,
    data,
  });
}
