import type { AugmentedProvider } from '@saberhq/solana-contrib';
import { TransactionEnvelope } from '@saberhq/solana-contrib';
import type { TokenAmount } from '@saberhq/token-utils';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token as SPLToken,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import type { PublicKey } from '@solana/web3.js';
import { SystemProgram } from '@solana/web3.js';

export type TransferParameters = {
  source: PublicKey;
  destination: PublicKey;
  amount: TokenAmount;
};

const transferBetweenSplTokenAccounts = (
  provider: AugmentedProvider,
  params: TransferParameters,
  wallet: PublicKey,
): TransactionEnvelope => {
  const transferInstruction = SPLToken.createTransferInstruction(
    TOKEN_PROGRAM_ID,
    params.source,
    params.destination,
    wallet,
    [],
    params.amount.toU64(),
  );

  return new TransactionEnvelope(provider, [transferInstruction]);
};

const createAndTransferToAssociatedTokenAccount = (
  provider: AugmentedProvider,
  source: PublicKey,
  associatedTokenAddress: PublicKey,
  associatedTokenOwner: PublicKey,
  amount: TokenAmount,
  wallet: PublicKey,
): TransactionEnvelope => {
  const instructions = [];

  instructions.push(
    SPLToken.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      amount.token.mintAccount,
      associatedTokenAddress,
      associatedTokenOwner,
      wallet,
    ),
  );

  instructions.push(
    SPLToken.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      source,
      associatedTokenAddress,
      wallet,
      [],
      amount.toU64(),
    ),
  );

  return new TransactionEnvelope(provider, instructions);
};

const transferSol = (
  provider: AugmentedProvider,
  params: TransferParameters,
): TransactionEnvelope => {
  console.log('Transfer SOL amount', params.amount);

  const transferInstruction = SystemProgram.transfer({
    fromPubkey: params.source,
    toPubkey: params.destination,
    lamports: params.amount.toU64().toNumber(),
  });

  return new TransactionEnvelope(provider, [transferInstruction]);
};

const transferTokens = async (
  provider: AugmentedProvider,
  params: TransferParameters,
  wallet: PublicKey,
): Promise<TransactionEnvelope> => {
  // Get info about destination address
  const destinationInfo = await provider.getAccountInfo(params.destination);
  // If it's founded and spl token
  if (destinationInfo?.accountInfo.owner.equals(TOKEN_PROGRAM_ID)) {
    return transferBetweenSplTokenAccounts(provider, params, wallet);
  }

  const associatedTokenAddress = await SPLToken.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    params.amount.token.mintAccount,
    params.destination,
  );

  const associatedInfo = await provider.getAccountInfo(associatedTokenAddress);
  if (associatedInfo?.accountInfo.owner.equals(TOKEN_PROGRAM_ID)) {
    return transferBetweenSplTokenAccounts(
      provider,
      { ...params, destination: associatedTokenAddress },
      wallet,
    );
  }

  return createAndTransferToAssociatedTokenAccount(
    provider,
    params.source,
    associatedTokenAddress,
    params.destination,
    params.amount,
    wallet,
  );
};

export const transfer = async (
  provider: AugmentedProvider,
  params: TransferParameters,
  wallet: PublicKey,
): Promise<TransactionEnvelope> => {
  if (params.source.equals(wallet)) {
    return transferSol(provider, params);
  }

  return transferTokens(provider, params, wallet);
};
