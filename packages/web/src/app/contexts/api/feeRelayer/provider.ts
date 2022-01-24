import { useSolana } from '@p2p-wallet-web/core';
import { useConnectionContext } from '@saberhq/use-solana';
import { u64 } from '@solana/spl-token';
import type { TransactionInstruction } from '@solana/web3.js';
import { Account, PublicKey, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { createContainer } from 'unstated-next';

import { feeRelayerUrl } from 'config/constants';

import {
  closeTokenAccountInstruction,
  createApproveInstruction,
  createAssociatedTokenAccountInstruction,
  createRelayTopUpSwapDirectInstruction,
  createRelayTopUpSwapTransitiveInstruction,
  createRelayTransferSolInstruction,
  createTransferSOLInstruction,
  createTransferTokenInstruction,
  createTransitTokenAccount,
} from './instructions';
import { serializeToRelayTransaction } from './transaction';
import type {
  CompensationArgs,
  RelayTopUpWithSwap,
  RelayTransaction,
  RelayTransferParams,
  SignedTransaction,
  SwapDirectParams,
  SwapTransitiveParams,
  TransactionSignatures,
  UserRelayAccount,
} from './types';

export const RELAY_PROGRAM_ID = new PublicKey('12YKFL4mnZz6CBEGePrf293mEzueQM3h8VLPUJsKpGs9');

export const RELAY_ACCOUNT_RENT_EXEMPTION = new u64(890880);

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

const getFeePayerPubkey = async (feeRelayerURL: string): Promise<PublicKey> => {
  if (!feeRelayerUrl) {
    throw new Error('feeRelayerUrl must be set');
  }

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

const sendTransaction = async (
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
  if (!feeRelayerUrl) {
    throw new Error('feeRelayerUrl must be set');
  }

  try {
    const res = await fetch(`${feeRelayerURL}${path}`, options);

    if (!res.ok) {
      throw new Error('sendTransaction something wrong');
    }

    const [result] = await res.json();

    return Array.isArray(result) ? bs58.encode(result) : (result as string);
  } catch (error) {
    console.error(error);
    throw new Error("Can't send transaction");
  }
};

export interface FeeRelayerService {
  transfer: (params: RelayTransferParams) => Promise<string>;
  getUserRelayAccount: () => Promise<UserRelayAccount>;
  relayTopUpWithSwap: (params: CompensationArgs) => Promise<string>;
}

const useFeeRelayerInternal = (): FeeRelayerService => {
  const { connection, network } = useConnectionContext();
  const { wallet } = useSolana();

  if (!feeRelayerUrl) {
    throw new Error('feeRelayerUrl must be set');
  }

  const isMainnet = network === 'mainnet-beta';
  const feeRelayerURL: string = isMainnet ? feeRelayerUrl : (feeRelayerUrl as string) + '/v2';

  const createTransferInstructions = (
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

  const createAndSignTransaction = async (
    feePayer: PublicKey,
    instructions: TransactionInstruction[],
    signers: Account[] = [],
  ): Promise<SignedTransaction> => {
    if (!wallet) {
      throw new Error('Wallet not ready');
    }

    const { blockhash: recentBlockhash } = await connection.getRecentBlockhash();

    const transaction = new Transaction({
      recentBlockhash,
      feePayer,
    });
    transaction.add(...instructions);

    if (signers.length > 0) {
      transaction.partialSign(...signers);
    }

    const signedTransaction = await wallet.signTransaction(transaction);

    const signatures: TransactionSignatures = {};
    for (const sig of signedTransaction.signatures) {
      if (!sig.signature) {
        continue;
      }
      signatures[sig.publicKey.toBase58()] = bs58.encode(sig.signature);
    }

    return {
      signedTransaction,
      signatures,
    };
  };

  const transfer = async (params: RelayTransferParams): Promise<string> => {
    if (!wallet?.publicKey) {
      throw new Error('Wallet not ready');
    }

    const feePayer = await getFeePayerPubkey(feeRelayerURL);

    const isPayInSol = params.feeToken?.balance?.token.isRawSOL;
    const accountCreationPayer = isPayInSol ? wallet.publicKey : feePayer;

    const instructions = createTransferInstructions(params, wallet.publicKey, accountCreationPayer);

    if (!isPayInSol) {
      const userRelayAddress = await getUserRelayAddress(wallet.publicKey);

      instructions.unshift(
        createRelayTransferSolInstruction(
          RELAY_PROGRAM_ID,
          wallet.publicKey,
          userRelayAddress,
          feePayer,
          params.compensation?.compensationAmount || new u64(2039280), // FIXME
        ),
      );
    }

    const { signedTransaction } = await createAndSignTransaction(feePayer, instructions);

    return sendTransaction(
      feeRelayerURL,
      '/relay_transaction',
      serializeToRelayTransaction(signedTransaction),
    );
  };

  const getUserRelayAccount = async (): Promise<UserRelayAccount> => {
    if (!wallet?.publicKey) {
      throw new Error('Wallet not ready');
    }

    const account = await connection.getAccountInfo(await getUserRelayAddress(wallet.publicKey));
    if (!account) {
      return {
        exist: false,
      };
    }

    return {
      exist: true,
      balance: account.lamports,
    };
  };

  const relayTopUpWithSwap = async (args: CompensationArgs): Promise<string> => {
    if (!wallet?.publicKey) {
      throw new Error('Wallet not ready');
    }

    const feePayer = await getFeePayerPubkey(feeRelayerURL);

    const instructions: TransactionInstruction[] = [];

    const userTransferAuthority = new Account();
    const userTransferAuthorityPublicKey = userTransferAuthority.publicKey;
    const userRalayAccount = await getUserRelayAddress(wallet.publicKey);
    const userTemporaryWsolAccount = await getUserTemporaryWsolAccount(wallet.publicKey);

    if (!args.feeToken.key || !args.feeToken.balance) {
      throw new Error('feeToken must be set');
    }

    const userSourceTokenAccount = args.feeToken.key;

    if (args.needCreateUserRalayAccount) {
      instructions.push(
        createTransferSOLInstruction(
          feePayer,
          userRalayAccount,
          RELAY_ACCOUNT_RENT_EXEMPTION.toNumber(),
        ),
      );
    }

    instructions.push(
      createApproveInstruction(
        userSourceTokenAccount,
        userTransferAuthorityPublicKey,
        wallet.publicKey,
        args.sourceAmount,
      ),
    );

    let topUpSwap;
    if ((args.topUpParams as SwapDirectParams).Spl) {
      const data = (args.topUpParams as SwapDirectParams).Spl;

      instructions.push(
        createRelayTopUpSwapDirectInstruction(
          RELAY_PROGRAM_ID,
          feePayer,
          wallet.publicKey,
          userRalayAccount,
          userTransferAuthorityPublicKey,
          userSourceTokenAccount,
          userTemporaryWsolAccount,
          data.swapProgramId,
          data.swapAccount,
          data.swapAuthority,
          data.swapSource,
          data.swapDestination,
          data.poolTokenMint,
          data.poolFeeAccount,
          data.amountIn,
          data.minimumAmountOut,
        ),
      );

      topUpSwap = {
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
      };
    } else {
      const data = (args.topUpParams as SwapTransitiveParams).SplTransitive;
      const transitTokenAccountAddress = await getTransitTokenAccountAddress(
        wallet.publicKey,
        data.transitTokenMintPubkey,
      );

      instructions.push(
        createTransitTokenAccount(
          RELAY_PROGRAM_ID,
          feePayer,
          wallet.publicKey,
          transitTokenAccountAddress,
          data.transitTokenMintPubkey,
        ),
      );

      instructions.push(
        createRelayTopUpSwapTransitiveInstruction(
          RELAY_PROGRAM_ID,
          feePayer,
          wallet.publicKey,
          userRalayAccount,
          userTransferAuthorityPublicKey,
          userSourceTokenAccount,
          transitTokenAccountAddress,
          userTemporaryWsolAccount,
          data.from.swapProgramId,
          data.from.swapAccount,
          data.from.swapAuthority,
          data.from.swapSource,
          data.from.swapDestination,
          data.from.poolTokenMint,
          data.from.poolFeeAccount,
          data.to.swapProgramId,
          data.to.swapAccount,
          data.to.swapAuthority,
          data.to.swapSource,
          data.to.swapDestination,
          data.to.poolTokenMint,
          data.to.poolFeeAccount,
          data.from.amountIn,
          data.from.minimumAmountOut,
          data.to.minimumAmountOut,
        ),
      );

      instructions.push(
        closeTokenAccountInstruction(transitTokenAccountAddress, feePayer, feePayer),
      );

      topUpSwap = {
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
          transit_token_mint_pubkey: transitTokenAccountAddress.toBase58(),
        },
      };
    }

    instructions.push(
      createRelayTransferSolInstruction(
        RELAY_PROGRAM_ID,
        wallet.publicKey,
        userRalayAccount,
        feePayer,
        args.compensationAmount,
      ),
    );

    const { signedTransaction, signatures } = await createAndSignTransaction(
      feePayer,
      instructions,
      [userTransferAuthority],
    );

    const user_authority_signature = signatures[wallet.publicKey.toBase58()];
    const transfer_authority_signature = signatures[userTransferAuthorityPublicKey.toBase58()];

    if (!user_authority_signature || !transfer_authority_signature) {
      throw new Error('signatures must be set');
    }

    return sendTransaction(feeRelayerURL, '/relay_top_up_with_swap', {
      user_source_token_account_pubkey: userSourceTokenAccount.toBase58(),
      source_token_mint_pubkey: args.feeToken.balance?.token.mintAccount.toBase58(),
      user_authority_pubkey: wallet.publicKey.toBase58(),
      top_up_swap: topUpSwap,
      fee_amount: args.compensationAmount.toNumber(),
      signatures: {
        user_authority_signature,
        transfer_authority_signature,
      },
      blockhash: signedTransaction.recentBlockhash,
    });
  };

  return {
    transfer,
    getUserRelayAccount,
    relayTopUpWithSwap,
  };
};

export const { Provider: FeeRelayerProvider, useContainer: useFeeRelayer } =
  createContainer(useFeeRelayerInternal);
