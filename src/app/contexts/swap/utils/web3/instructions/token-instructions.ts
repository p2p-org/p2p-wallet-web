import { deriveAssociatedTokenAddress } from '@orca-so/sdk';
import { AccountLayout, ASSOCIATED_TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';

export function createTokenAccountInstructions(
  account: PublicKey,
  payer: PublicKey,
  mint: PublicKey,
  owner: PublicKey,
  tokenProgramId: PublicKey,
  accountRentExempt: number,
) {
  const instructions: TransactionInstruction[] = [];

  instructions.push(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: account,
      lamports: accountRentExempt,
      space: AccountLayout.span,
      programId: tokenProgramId,
    }),
  );

  instructions.push(Token.createInitAccountInstruction(tokenProgramId, mint, account, owner));

  return instructions;
}

export function createWSOLAccountInstructions(
  account: PublicKey,
  owner: PublicKey,
  tokenProgramId: PublicKey,
  solMint: PublicKey,
  amount: number,
  accountRentExempt: number,
) {
  const instructions: TransactionInstruction[] = [];

  instructions.push(
    SystemProgram.createAccount({
      fromPubkey: owner,
      newAccountPubkey: account,
      lamports: amount + accountRentExempt,
      space: AccountLayout.span,
      programId: tokenProgramId,
    }),
  );

  instructions.push(Token.createInitAccountInstruction(tokenProgramId, solMint, account, owner));

  return instructions;
}

export async function createAssociatedTokenAccountIx(
  fundingAddress: PublicKey,
  destPubKey: PublicKey,
  splTokenMintPubKey: PublicKey,
  tokenProgramId: PublicKey,
): Promise<[TransactionInstruction, PublicKey]> {
  const associatedTokenAddress = await deriveAssociatedTokenAddress(destPubKey, splTokenMintPubKey);

  const systemProgramId = new PublicKey('11111111111111111111111111111111');
  const keys = [
    {
      pubkey: fundingAddress,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: associatedTokenAddress,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: destPubKey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: splTokenMintPubKey,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: systemProgramId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: tokenProgramId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];
  const ix = new TransactionInstruction({
    keys,
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    data: Buffer.from([]),
  });
  return [ix, associatedTokenAddress];
}
