import { u64 } from '@solana/spl-token';
import type { Transaction } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

import type {
  FreeFeeLimitsResponce,
  RelaySignatures,
  RelayTopUpWithSwap,
  RelayTransaction,
  RequestInstruction,
  SplDirectArgs,
  SplTransitiveArgs,
  SwapParams,
  SwapTransitiveData,
} from './types';

export const RELAY_ACCOUNT_RENT_EXEMPTION = new u64(890880);
export const RELAY_PROGRAM_ID = new PublicKey('12YKFL4mnZz6CBEGePrf293mEzueQM3h8VLPUJsKpGs9');
export const INITIAL_USER_FREE_FEE_LIMITS = {
  currentTransactionCount: 100,
  maxTransactionCount: 0,
  hasFreeTransactions: true,
};

const findAddress = async (owner: PublicKey, key: string) => {
  const [address] = await PublicKey.findProgramAddress(
    [owner.toBuffer(), Buffer.from(key, 'utf-8')],
    RELAY_PROGRAM_ID,
  );
  return address;
};

export const getUserRelayAddress = async (owner: PublicKey) => {
  return await findAddress(owner, 'relay');
};

export const getUserTemporaryWsolAccount = async (owner: PublicKey) => {
  return await findAddress(owner, 'temporary_wsol');
};

export const getTransitTokenAccountAddress = async (owner: PublicKey, mint: PublicKey) => {
  const [address] = await PublicKey.findProgramAddress(
    [owner.toBuffer(), mint.toBuffer(), Buffer.from('transit', 'utf-8')],
    RELAY_PROGRAM_ID,
  );
  return address;
};

export const getFeePayerPubkey = async (feeRelayerURL: string): Promise<PublicKey> => {
  try {
    const res = await fetch(`${feeRelayerURL}/fee_payer/pubkey`);

    if (!res.ok) {
      throw new Error('getFeePayerPubkey something wrong');
    }

    const result = await res.text();

    return new PublicKey(result);
  } catch (error) {
    console.error(error);
    throw new Error("Can't get fee payer pubkey:");
  }
};

export const getFreeFeeLimits = async (
  feeRelayerURL: string,
  authority: PublicKey,
): Promise<FreeFeeLimitsResponce> => {
  try {
    const res = await fetch(`${feeRelayerURL}/free_fee_limits/${authority.toBase58()}`);

    if (!res.ok) {
      const err = await res.json();
      throw err;
    }

    return (await res.json()) as FreeFeeLimitsResponce;
  } catch (error) {
    console.error(error);
    throw new Error("Can't get free fee limits");
  }
};

export const sendTransaction = async (
  feeRelayerURL: string,
  path: string,
  transaction: RelayTransaction | RelayTopUpWithSwap,
): Promise<string> => {
  const options = {
    method: 'POST',
    body: JSON.stringify(transaction),
    headers: {
      'Content-Type': 'application/json',
    },
  };

  try {
    const res = await fetch(`${feeRelayerURL}${path}`, options);

    if (!res.ok) {
      const err = await res.json();
      throw err;
    }

    const [result] = await res.json();

    return Array.isArray(result) ? bs58.encode(result) : (result as string);
  } catch (error) {
    console.error(error);
    throw new Error("Can't send transaction");
  }
};

const findIndex = (arr: string[], key: string): number => arr.findIndex((k) => k === key);

export const serializeToRelayTransaction = (signedTransaction: Transaction): RelayTransaction => {
  const { instructions, signatures } = signedTransaction;

  const message = signedTransaction.compileMessage();
  const pubkeys = message.accountKeys.map((acc) => acc.toBase58());

  const requestInstructions = [] as RequestInstruction[];

  for (const instruction of instructions) {
    const accounts = [];
    for (const key of instruction.keys) {
      accounts.push({
        pubkey: findIndex(pubkeys, key.pubkey.toBase58()),
        is_signer: key.isSigner,
        is_writable: key.isWritable,
      });
    }

    requestInstructions.push({
      program_id: findIndex(pubkeys, instruction.programId.toBase58()),
      accounts,
      data: [...instruction.data.values()],
    });
  }

  const relayTransactionSignatures = {} as RelaySignatures;
  for (const sign of signatures) {
    if (!sign.signature) {
      continue;
    }

    relayTransactionSignatures[findIndex(pubkeys, sign.publicKey.toBase58())] = bs58.encode(
      sign.signature,
    );
  }

  return {
    instructions: requestInstructions,
    signatures: relayTransactionSignatures,
    pubkeys,
    blockhash: message.recentBlockhash,
  };
};

export const buildSwapDirectArgs = (
  data: SwapParams,
  userTransferAuthorityPublicKey: PublicKey,
): SplDirectArgs => ({
  Spl: {
    program_id: data.swapProgramId.toBase58(),
    account_pubkey: data.swapAccount.toBase58(),
    authority_pubkey: data.swapAuthority.toBase58(),
    transfer_authority_pubkey: userTransferAuthorityPublicKey.toBase58(),
    source_pubkey: data.swapSource.toBase58(),
    destination_pubkey: data.swapDestination.toBase58(),
    pool_token_mint_pubkey: data.poolTokenMint.toBase58(),
    pool_fee_account_pubkey: data.poolFeeAccount.toBase58(),
    amount_in: data.amountIn.toNumber(),
    minimum_amount_out: data.minimumAmountOut.toNumber(),
  },
});

export const buildSwapTransitiveArgs = (
  data: SwapTransitiveData,
  userTransferAuthorityPublicKey: PublicKey,
  needsCreateTransitTokenAccount: boolean,
): SplTransitiveArgs => ({
  SplTransitive: {
    from: {
      program_id: data.from.swapProgramId.toBase58(),
      account_pubkey: data.from.swapAccount.toBase58(),
      authority_pubkey: data.from.swapAuthority.toBase58(),
      transfer_authority_pubkey: userTransferAuthorityPublicKey.toBase58(),
      source_pubkey: data.from.swapSource.toBase58(),
      destination_pubkey: data.from.swapDestination.toBase58(),
      pool_token_mint_pubkey: data.from.poolTokenMint.toBase58(),
      pool_fee_account_pubkey: data.from.poolFeeAccount.toBase58(),
      amount_in: data.from.amountIn.toNumber(),
      minimum_amount_out: data.from.minimumAmountOut.toNumber(),
    },
    to: {
      program_id: data.to.swapProgramId.toBase58(),
      account_pubkey: data.to.swapAccount.toBase58(),
      authority_pubkey: data.to.swapAuthority.toBase58(),
      transfer_authority_pubkey: userTransferAuthorityPublicKey.toBase58(),
      source_pubkey: data.to.swapSource.toBase58(),
      destination_pubkey: data.to.swapDestination.toBase58(),
      pool_token_mint_pubkey: data.to.poolTokenMint.toBase58(),
      pool_fee_account_pubkey: data.to.poolFeeAccount.toBase58(),
      amount_in: data.to.amountIn.toNumber(),
      minimum_amount_out: data.to.minimumAmountOut.toNumber(),
    },
    transit_token_mint_pubkey: data.transitTokenMintPubkey.toBase58(),
    needs_create_transit_token_account: needsCreateTransitTokenAccount,
  },
});
