import type { u64 } from '@solana/spl-token';
import {
  AccountLayout,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import type { PublicKey } from '@solana/web3.js';
import {
  Account,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import BufferLayout from 'buffer-layout';

import { swapInstruction } from 'app/contexts/solana/swap/utils/web3/instructions/pool-instructions';

import type { RelayTransferParams } from './types';

export const createTransferSOLInstruction = (
  source: PublicKey,
  destination: PublicKey,
  amount: number,
): TransactionInstruction =>
  SystemProgram.transfer({
    fromPubkey: source,
    toPubkey: destination,
    lamports: amount,
  });

export const createTransferTokenInstruction = (
  source: PublicKey,
  destination: PublicKey,
  amount: number,
  tokenMint: PublicKey,
  tokenOwner: PublicKey,
  tokenDecimals: number,
): TransactionInstruction =>
  Token.createTransferCheckedInstruction(
    TOKEN_PROGRAM_ID,
    source,
    tokenMint,
    destination,
    tokenOwner,
    [],
    amount,
    tokenDecimals,
  );

export const createAssociatedTokenAccountInstruction = (
  associatedTokenAddress: PublicKey,
  associatedTokenOwner: PublicKey,
  tokenMint: PublicKey,
  feePayer: PublicKey,
): TransactionInstruction =>
  Token.createAssociatedTokenAccountInstruction(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    tokenMint,
    associatedTokenAddress,
    associatedTokenOwner,
    feePayer,
  );

export const createApproveInstruction = (
  userTokenPublicKey: PublicKey,
  authority: PublicKey,
  owner: PublicKey,
  amount: u64,
) =>
  Token.createApproveInstruction(
    TOKEN_PROGRAM_ID,
    userTokenPublicKey,
    authority,
    owner,
    [],
    amount,
  );

export const createRelayTransferSolInstruction = (
  programId: PublicKey,
  userAuthority: PublicKey,
  userRelayAccount: PublicKey,
  recipient: PublicKey,
  amount: u64,
): TransactionInstruction => {
  const keys = [
    { pubkey: userAuthority, isSigner: true, isWritable: false },
    { pubkey: userRelayAccount, isSigner: false, isWritable: true },
    { pubkey: recipient, isSigner: false, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];
  const dataLayout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    BufferLayout.blob(8, 'amount'),
  ]);

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: 2,
      amount: amount.toBuffer(),
    },
    data,
  );

  return new TransactionInstruction({
    keys,
    programId,
    data,
  });
};

export const createRelayTopUpSwapDirectInstruction = (
  programId: PublicKey,
  feePayer: PublicKey,
  userAuthority: PublicKey,
  userRelayAccount: PublicKey,
  userTransferAuthority: PublicKey,
  userSourceTokenAccount: PublicKey,
  userTemporaryWsolAccount: PublicKey,
  swapProgramId: PublicKey,
  swapAccount: PublicKey,
  swapAuthority: PublicKey,
  swapSource: PublicKey,
  swapDestination: PublicKey,
  poolTokenMint: PublicKey,
  poolFeeAccount: PublicKey,
  amountIn: u64,
  minimumAmountOut: u64,
): TransactionInstruction => {
  const keys = [
    { pubkey: NATIVE_MINT, isSigner: false, isWritable: false },
    { pubkey: feePayer, isSigner: true, isWritable: true },
    { pubkey: userAuthority, isSigner: true, isWritable: false },
    { pubkey: userRelayAccount, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: swapProgramId, isSigner: false, isWritable: false },
    { pubkey: swapAccount, isSigner: false, isWritable: false },
    { pubkey: swapAuthority, isSigner: false, isWritable: false },
    { pubkey: userTransferAuthority, isSigner: true, isWritable: false },
    { pubkey: userSourceTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userTemporaryWsolAccount, isSigner: false, isWritable: true },
    { pubkey: swapSource, isSigner: false, isWritable: true },
    { pubkey: swapDestination, isSigner: false, isWritable: true },
    { pubkey: poolTokenMint, isSigner: false, isWritable: true },
    { pubkey: poolFeeAccount, isSigner: false, isWritable: true },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  const dataLayout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    BufferLayout.blob(8, 'amountIn'),
    BufferLayout.blob(8, 'minimumAmountOut'),
  ]);

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: 0,
      amountIn: amountIn.toBuffer(),
      minimumAmountOut: minimumAmountOut.toBuffer(),
    },
    data,
  );

  return new TransactionInstruction({
    keys,
    programId,
    data,
  });
};

export const createRelayTopUpSwapTransitiveInstruction = (
  programId: PublicKey,
  feePayer: PublicKey,
  userAuthority: PublicKey,
  userRelayAccount: PublicKey,
  userTransferAuthority: PublicKey,
  userSourceTokenAccount: PublicKey,
  userTransitTokenAccount: PublicKey,
  userDestinationTokenAccount: PublicKey,
  swapFromProgramId: PublicKey,
  swapFromAccount: PublicKey,
  swapFromAuthority: PublicKey,
  swapFromSource: PublicKey,
  swapFromDestination: PublicKey,
  swapFromPoolTokenMint: PublicKey,
  swapFromPoolFeeAccount: PublicKey,
  swapToProgramId: PublicKey,
  swapToAccount: PublicKey,
  swapToAuthority: PublicKey,
  swapToSource: PublicKey,
  swapToDestination: PublicKey,
  swapToPoolTokenMint: PublicKey,
  swapToPoolFeeAccount: PublicKey,
  amountIn: u64,
  transitMinimumAmount: u64,
  minimumAmountOut: u64,
): TransactionInstruction => {
  const keys = [
    { pubkey: NATIVE_MINT, isSigner: false, isWritable: false },
    { pubkey: feePayer, isSigner: true, isWritable: true },
    { pubkey: userAuthority, isSigner: true, isWritable: false },
    { pubkey: userRelayAccount, isSigner: false, isWritable: true },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: userTransferAuthority, isSigner: true, isWritable: false },
    { pubkey: userSourceTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userTransitTokenAccount, isSigner: false, isWritable: true },
    { pubkey: userDestinationTokenAccount, isSigner: false, isWritable: true },
    { pubkey: swapFromProgramId, isSigner: false, isWritable: false },
    { pubkey: swapFromAccount, isSigner: false, isWritable: false },
    { pubkey: swapFromAuthority, isSigner: false, isWritable: false },
    { pubkey: swapFromSource, isSigner: false, isWritable: true },
    { pubkey: swapFromDestination, isSigner: false, isWritable: true },
    { pubkey: swapFromPoolTokenMint, isSigner: false, isWritable: true },
    { pubkey: swapFromPoolFeeAccount, isSigner: false, isWritable: true },
    { pubkey: swapToProgramId, isSigner: false, isWritable: false },
    { pubkey: swapToAccount, isSigner: false, isWritable: false },
    { pubkey: swapToAuthority, isSigner: false, isWritable: false },
    { pubkey: swapToSource, isSigner: false, isWritable: true },
    { pubkey: swapToDestination, isSigner: false, isWritable: true },
    { pubkey: swapToPoolTokenMint, isSigner: false, isWritable: true },
    { pubkey: swapToPoolFeeAccount, isSigner: false, isWritable: true },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  const dataLayout = BufferLayout.struct([
    BufferLayout.u8('instruction'),
    BufferLayout.blob(8, 'amountIn'),
    BufferLayout.blob(8, 'transitMinimumAmount'),
    BufferLayout.blob(8, 'minimumAmountOut'),
  ]);

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: 1,
      amountIn: amountIn.toBuffer(),
      transitMinimumAmount: transitMinimumAmount.toBuffer(),
      minimumAmountOut: minimumAmountOut.toBuffer(),
    },
    data,
  );

  return new TransactionInstruction({
    keys,
    programId,
    data,
  });
};

export const createTransitTokenAccount = (
  programId: PublicKey,
  feePayer: PublicKey,
  userAuthority: PublicKey,
  transitTokenAccount: PublicKey,
  transitTokenMint: PublicKey,
): TransactionInstruction => {
  const keys = [
    { pubkey: transitTokenAccount, isSigner: false, isWritable: true },
    { pubkey: transitTokenMint, isSigner: false, isWritable: false },
    { pubkey: userAuthority, isSigner: true, isWritable: true },
    { pubkey: feePayer, isSigner: true, isWritable: false },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ];

  const dataLayout = BufferLayout.struct([BufferLayout.u8('instruction')]);

  const data = Buffer.alloc(dataLayout.span);
  dataLayout.encode(
    {
      instruction: 3,
    },
    data,
  );
  return new TransactionInstruction({
    keys,
    programId,
    data,
  });
};

export const closeTokenAccountInstruction = (
  account: PublicKey,
  dectination: PublicKey,
  authority: PublicKey,
): TransactionInstruction => {
  return Token.createCloseAccountInstruction(TOKEN_PROGRAM_ID, account, dectination, authority, []);
};

export const createTransferInstructions = (
  params: RelayTransferParams,
  authority: PublicKey,
  payer: PublicKey,
): TransactionInstruction[] => {
  const { fromTokenAccount, destinationAccount, amount } = params;
  const instructions: TransactionInstruction[] = [];

  if (!fromTokenAccount.key) {
    throw new Error('This should never happen');
  }

  if (fromTokenAccount.balance?.token.isRawSOL) {
    instructions.push(
      createTransferSOLInstruction(
        fromTokenAccount.key,
        destinationAccount.address,
        amount.toU64().toNumber(),
      ),
    );

    return instructions;
  }

  if (destinationAccount.isNeedCreate) {
    if (!destinationAccount.owner) {
      throw new Error('This should never happen');
    }

    instructions.push(
      createAssociatedTokenAccountInstruction(
        destinationAccount.address,
        destinationAccount.owner,
        amount.token.mintAccount,
        payer,
      ),
    );
  }

  instructions.push(
    createTransferTokenInstruction(
      fromTokenAccount.key,
      destinationAccount.address,
      amount.toU64().toNumber(),
      amount.token.mintAccount,
      authority,
      amount.token.decimals,
    ),
  );

  return instructions;
};

export const createWSOLAccountInstructions = (
  accountCreationPayer: PublicKey,
  owner: PublicKey,
  amount: u64,
  accountRentExempt: number,
) => {
  const account = new Account();
  const instructions: TransactionInstruction[] = [];

  instructions.push(
    SystemProgram.createAccount({
      fromPubkey: accountCreationPayer,
      newAccountPubkey: account.publicKey,
      lamports: amount.toNumber() + accountRentExempt,
      space: AccountLayout.span,
      programId: TOKEN_PROGRAM_ID,
    }),
  );

  instructions.push(
    Token.createInitAccountInstruction(TOKEN_PROGRAM_ID, NATIVE_MINT, account.publicKey, owner),
  );

  return {
    instructions,
    cleanupInstructions: [
      Token.createCloseAccountInstruction(TOKEN_PROGRAM_ID, account.publicKey, owner, owner, []),
    ],
    account,
  };
};

export const createUserSwapInstruction = (
  userTransferAuthority: PublicKey,
  userSourceTokenAccount: PublicKey,
  userDestinationTokenAccount: PublicKey,
  hostFeeAccountPublicKey: PublicKey | null,
  swapProgramId: PublicKey,
  swapAccount: PublicKey,
  swapAuthority: PublicKey,
  swapSource: PublicKey,
  swapDestination: PublicKey,
  poolTokenMint: PublicKey,
  poolFeeAccount: PublicKey,
  amountIn: u64,
  minimumAmountOut: u64,
): TransactionInstruction =>
  swapInstruction(
    swapAccount,
    swapAuthority,
    userTransferAuthority,
    userSourceTokenAccount,
    swapSource,
    swapDestination,
    userDestinationTokenAccount,
    poolTokenMint,
    poolFeeAccount,
    hostFeeAccountPublicKey,
    swapProgramId,
    TOKEN_PROGRAM_ID,
    amountIn,
    minimumAmountOut,
  );
