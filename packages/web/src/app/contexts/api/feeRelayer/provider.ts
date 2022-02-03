import { useCallback } from 'react';

import { useSolana } from '@p2p-wallet-web/core';
import { useConnectionContext } from '@saberhq/use-solana';
import { u64 } from '@solana/spl-token';
import type { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { Account, Transaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { createContainer } from 'unstated-next';

import { feeRelayerUrl } from 'config/constants';

import {
  closeTokenAccountInstruction,
  createApproveInstruction,
  createRelayTopUpSwapDirectInstruction,
  createRelayTopUpSwapTransitiveInstruction,
  createRelayTransferSolInstruction,
  createTransferInstructions,
  createTransferSOLInstruction,
  createTransitTokenAccount,
} from './instructions';
import type {
  CompensationParams,
  RelayTransferParams,
  SignedTransaction,
  SwapDirectParams,
  SwapTransitiveParams,
  TransactionSignatures,
  UserRelayAccount,
} from './types';
import {
  buildSwapDirectArgs,
  buildSwapTransitiveArgs,
  getFeePayerPubkey,
  getTransitTokenAccountAddress,
  getUserRelayAddress,
  getUserTemporaryWsolAccount,
  RELAY_ACCOUNT_RENT_EXEMPTION,
  RELAY_PROGRAM_ID,
  sendTransaction,
  serializeToRelayTransaction,
} from './utils';

export interface FeeRelayerService {
  transfer: (params: RelayTransferParams) => Promise<string>;
  getUserRelayAccount: () => Promise<UserRelayAccount | null>;
  relayTopUpWithSwap: (params: CompensationParams) => Promise<string>;
}

const useFeeRelayerInternal = (): FeeRelayerService => {
  const { connection, network } = useConnectionContext();
  const { wallet } = useSolana();

  if (!feeRelayerUrl) {
    throw new Error('feeRelayerUrl must be set');
  }

  const isMainnet = network === 'mainnet-beta';
  const feeRelayerURL: string = isMainnet ? feeRelayerUrl : (feeRelayerUrl as string) + '/v2';

  const createAndSignTransaction = useCallback(
    async (
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
    },
    [connection, wallet],
  );

  const transfer = useCallback(
    async (params: RelayTransferParams): Promise<string> => {
      if (!wallet?.publicKey) {
        throw new Error('Wallet not ready');
      }

      const feePayer = await getFeePayerPubkey(feeRelayerURL);

      const isPayInSol = params.compensationParams?.feeToken?.balance?.token.isRawSOL;
      const accountCreationPayer = isPayInSol ? wallet.publicKey : feePayer;

      const instructions = createTransferInstructions(
        params,
        wallet.publicKey,
        accountCreationPayer,
      );

      if (!isPayInSol) {
        const userRelayAddress = await getUserRelayAddress(wallet.publicKey);

        instructions.unshift(
          createRelayTransferSolInstruction(
            RELAY_PROGRAM_ID,
            wallet.publicKey,
            userRelayAddress,
            feePayer,
            params.compensationParams?.accountRentExemption || new u64(2039280), // FIXME
          ),
        );
      }

      const { signedTransaction } = await createAndSignTransaction(feePayer, instructions);

      return sendTransaction(
        feeRelayerURL,
        '/relay_transaction',
        serializeToRelayTransaction(signedTransaction),
      );
    },
    [createAndSignTransaction, feeRelayerURL, wallet],
  );

  const getUserRelayAccount = useCallback(async (): Promise<UserRelayAccount | null> => {
    if (!wallet?.publicKey) {
      return null;
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
  }, [connection, wallet]);

  const relayTopUpWithSwap = useCallback(
    async (args: CompensationParams): Promise<string> => {
      if (!wallet?.publicKey) {
        throw new Error('Wallet not ready');
      }

      const feePayer = await getFeePayerPubkey(feeRelayerURL);

      const instructions: TransactionInstruction[] = [];

      const userTransferAuthority = new Account();
      const userTransferAuthorityPublicKey = userTransferAuthority.publicKey;
      const userRalayAccount = await getUserRelayAddress(wallet.publicKey);
      const userTemporaryWsolAccount = await getUserTemporaryWsolAccount(wallet.publicKey);

      if (!args.feeToken?.key || !args.feeToken.balance) {
        throw new Error('feeToken must be set');
      }

      const userSourceTokenAccount = args.feeToken.key;

      if (!args.isRelayAccountExist) {
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
          args.feeAmountInToken,
        ),
      );

      let topUpSwapArgs;
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

        topUpSwapArgs = buildSwapDirectArgs(data, userTransferAuthorityPublicKey);
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

        topUpSwapArgs = buildSwapTransitiveArgs(data, userTransferAuthorityPublicKey);
      }

      instructions.push(
        createRelayTransferSolInstruction(
          RELAY_PROGRAM_ID,
          wallet.publicKey,
          userRalayAccount,
          feePayer,
          args.feeAmount,
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
        top_up_swap: topUpSwapArgs,
        fee_amount: args.feeAmount.toNumber(),
        signatures: {
          user_authority_signature,
          transfer_authority_signature,
        },
        blockhash: signedTransaction.recentBlockhash,
      });
    },
    [createAndSignTransaction, feeRelayerURL, wallet],
  );

  return {
    transfer,
    getUserRelayAccount,
    relayTopUpWithSwap,
  };
};

export const { Provider: FeeRelayerProvider, useContainer: useFeeRelayer } =
  createContainer(useFeeRelayerInternal);
