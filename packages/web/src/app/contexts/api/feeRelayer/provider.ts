import { useCallback } from 'react';

import { ZERO } from '@orca-so/sdk';
import { useSolana } from '@p2p-wallet-web/core';
import { useConnectionContext } from '@saberhq/use-solana';
import type { Account, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { Transaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { createContainer } from 'unstated-next';

import { feeRelayerUrl } from 'config/constants';

import {
  createAssociatedTokenAccountInstruction,
  createRelayTopUpSwapDirectInstruction,
  createRelayTopUpSwapTransitiveInstruction,
  createRelayTransferSolInstruction,
  createTransferInstructions,
  createTransferSOLInstruction,
  createTransitTokenAccount,
  createUserSwapInstruction,
  createWSOLAccountInstructions,
} from './instructions';
import type {
  NextTransactionCompensation,
  RelayTopUpWithSwapArgs,
  RelayTransferParams,
  SignedTransaction,
  SwapDirectParams,
  SwapTransitiveParams,
  TransactionSignatures,
  UserFreeFeeLimits,
  UserRelayAccount,
  UserSetupSwap,
  UserSwap,
  UserSwapParams,
  UserSwapTransitiveParams,
} from './types';
import {
  buildSwapDirectArgs,
  buildSwapTransitiveArgs,
  getFeePayerPubkey,
  getFreeFeeLimits,
  getTransitTokenAccountAddress,
  getUserRelayAddress,
  getUserTemporaryWsolAccount,
  INITIAL_USER_FREE_FEE_LIMITS,
  RELAY_ACCOUNT_RENT_EXEMPTION,
  RELAY_PROGRAM_ID,
  sendTransaction,
  serializeToRelayTransaction,
} from './utils';

export interface FeeRelayerService {
  transfer: (
    params: RelayTransferParams,
    nextTransactionCompensation?: NextTransactionCompensation,
  ) => Promise<string>;
  getUserRelayAccount: () => Promise<UserRelayAccount | null>;
  getUserFreeFeeLimits: () => Promise<UserFreeFeeLimits>;
  relayTopUpWithSwap: (params: RelayTopUpWithSwapArgs) => Promise<string>;
  userSetupSwap: (
    params: UserSetupSwap,
    nextTransactionCompensation?: NextTransactionCompensation,
  ) => Promise<string>;
  userSwap: (
    params: UserSwap,
    nextTransactionCompensation?: NextTransactionCompensation,
  ) => Promise<string>;
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
    async (
      params: RelayTransferParams,
      nextTransactionCompensation?: NextTransactionCompensation,
    ): Promise<string> => {
      if (!wallet?.publicKey) {
        throw new Error('Wallet not ready');
      }

      const feePayer = await getFeePayerPubkey(feeRelayerURL);
      const isNeedCompensation = nextTransactionCompensation?.feeAmount.gt(ZERO);
      const isPayInSol =
        isNeedCompensation && nextTransactionCompensation?.feeToken?.balance?.token.isRawSOL;
      const accountCreationPayer = isPayInSol ? wallet.publicKey : feePayer;
      const instructions = createTransferInstructions(
        params,
        wallet.publicKey,
        accountCreationPayer,
      );

      if (isNeedCompensation && !isPayInSol && nextTransactionCompensation?.feeAmount) {
        const userRelayAddress = await getUserRelayAddress(wallet.publicKey);

        instructions.unshift(
          createRelayTransferSolInstruction(
            RELAY_PROGRAM_ID,
            wallet.publicKey,
            userRelayAddress,
            feePayer,
            nextTransactionCompensation.feeAmount,
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

  const getUserFreeFeeLimits = useCallback(async (): Promise<UserFreeFeeLimits> => {
    if (!wallet?.publicKey) {
      return INITIAL_USER_FREE_FEE_LIMITS;
    }

    const result = await getFreeFeeLimits(feeRelayerURL, wallet.publicKey);

    const currentTransactionCount = result.processed_fee.count;
    const maxTransactionCount = result.limits.max_count;

    return {
      currentTransactionCount,
      maxTransactionCount,
      hasFreeTransactions: maxTransactionCount - currentTransactionCount > 0,
    };
  }, [feeRelayerURL, wallet]);

  const relayTopUpWithSwap = useCallback(
    async (args: RelayTopUpWithSwapArgs): Promise<string> => {
      if (!wallet?.publicKey) {
        throw new Error('Wallet not ready');
      }

      const feePayer = await getFeePayerPubkey(feeRelayerURL);

      const instructions: TransactionInstruction[] = [];

      const userTransferAuthorityPublicKey = wallet.publicKey;
      const userRalayAccount = await getUserRelayAddress(wallet.publicKey);
      const userTemporaryWsolAccount = await getUserTemporaryWsolAccount(wallet.publicKey);

      if (!args.feeToken?.key || !args.feeToken.balance) {
        throw new Error('feeToken must be set');
      }

      const userSourceTokenAccount = args.feeToken.key;

      if (args.needCreateRelayAccount) {
        instructions.push(
          createTransferSOLInstruction(
            feePayer,
            userRalayAccount,
            RELAY_ACCOUNT_RENT_EXEMPTION.toNumber(),
          ),
        );
      }

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

        const needsCreateTransitTokenAccount = (await connection.getAccountInfo(
          transitTokenAccountAddress,
        ))
          ? false
          : true;

        if (needsCreateTransitTokenAccount) {
          instructions.push(
            createTransitTokenAccount(
              RELAY_PROGRAM_ID,
              feePayer,
              wallet.publicKey,
              transitTokenAccountAddress,
              data.transitTokenMintPubkey,
            ),
          );
        }

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

        topUpSwapArgs = buildSwapTransitiveArgs(
          data,
          userTransferAuthorityPublicKey,
          needsCreateTransitTokenAccount,
        );
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
    [connection, createAndSignTransaction, feeRelayerURL, wallet],
  );

  const userSetupSwap = useCallback(
    async (params: UserSetupSwap, nextTransactionCompensation?: NextTransactionCompensation) => {
      if (!wallet?.publicKey) {
        throw new Error('Wallet not ready');
      }
      const instructions: TransactionInstruction[] = [];

      const feePayer = await getFeePayerPubkey(feeRelayerURL);
      const isPayInSol = nextTransactionCompensation?.feeToken?.balance?.token.isRawSOL;
      const accountCreationPayer = isPayInSol ? wallet.publicKey : feePayer;

      if (!isPayInSol && nextTransactionCompensation?.feeAmount) {
        const userRelayAddress = await getUserRelayAddress(wallet.publicKey);

        instructions.push(
          createRelayTransferSolInstruction(
            RELAY_PROGRAM_ID,
            wallet.publicKey,
            userRelayAddress,
            feePayer,
            nextTransactionCompensation.feeAmount,
          ),
        );
      }

      instructions.push(
        createAssociatedTokenAccountInstruction(
          params.associatedTokenAddress,
          params.owner,
          params.mint,
          accountCreationPayer,
        ),
      );
      const { signedTransaction } = await createAndSignTransaction(feePayer, instructions);

      return sendTransaction(
        feeRelayerURL,
        '/relay_transaction',
        serializeToRelayTransaction(signedTransaction),
      );
    },
    [createAndSignTransaction, feeRelayerURL, wallet],
  );

  const userSwap = useCallback(
    async (params: UserSwap, nextTransactionCompensation?: NextTransactionCompensation) => {
      if (!wallet?.publicKey) {
        throw new Error('Wallet not ready');
      }

      const instructions: TransactionInstruction[] = [];
      const cleanupInstructions: TransactionInstruction[] = [];
      const signers: Account[] = [];

      const feePayer = await getFeePayerPubkey(feeRelayerURL);
      const isPayInSol = nextTransactionCompensation?.feeToken?.balance?.token.isRawSOL;
      const accountCreationPayer = isPayInSol ? wallet.publicKey : feePayer;
      const userTransferAuthorityPublicKey = wallet.publicKey;

      let inputUserTokenPublicKey = params.userSourceTokenAccount;
      let outputUserTokenPublicKey = params.userDestinationTokenAccount;

      if (!outputUserTokenPublicKey) {
        throw new Error('outputUserTokenPublicKey must be set');
      }

      if (params.exchangeData.wsolAccountParams) {
        const { amount, accountRentExempt } = params.exchangeData.wsolAccountParams;
        const isInput = params.exchangeData.wsolAccountParams.direction === 'input';

        const {
          instructions: wsolInstructions,
          cleanupInstructions: wsolCleanupInstructions,
          account,
        } = createWSOLAccountInstructions(
          accountCreationPayer,
          wallet.publicKey,
          amount,
          accountRentExempt,
        );

        signers.push(account);

        instructions.push(...wsolInstructions);
        cleanupInstructions.push(...wsolCleanupInstructions);

        if (isInput) {
          inputUserTokenPublicKey = account.publicKey;
        } else {
          outputUserTokenPublicKey = account.publicKey;
          if (accountCreationPayer.equals(feePayer) && nextTransactionCompensation?.feeAmount) {
            const userRalayAccount = await getUserRelayAddress(wallet.publicKey);

            instructions.push(
              createRelayTransferSolInstruction(
                RELAY_PROGRAM_ID,
                wallet.publicKey,
                userRalayAccount,
                feePayer,
                nextTransactionCompensation.feeAmount,
              ),
            );
          }
        }
      }

      if (params.type === 'direct') {
        const data = params.exchangeData.swapParams as UserSwapParams;
        instructions.push(
          createUserSwapInstruction(
            userTransferAuthorityPublicKey,
            inputUserTokenPublicKey,
            outputUserTokenPublicKey,
            wallet.publicKey,
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
      } else {
        const data = params.exchangeData.swapParams as UserSwapTransitiveParams;
        instructions.push(
          createUserSwapInstruction(
            userTransferAuthorityPublicKey,
            inputUserTokenPublicKey,
            data.intermediateTokenAccount,
            null,
            data.from.swapProgramId,
            data.from.swapAccount,
            data.from.swapAuthority,
            data.from.swapSource,
            data.from.swapDestination,
            data.from.poolTokenMint,
            data.from.poolFeeAccount,
            data.from.amountIn,
            data.from.minimumAmountOut,
          ),
        );

        instructions.push(
          createUserSwapInstruction(
            userTransferAuthorityPublicKey,
            data.intermediateTokenAccount,
            outputUserTokenPublicKey,
            null,
            data.to.swapProgramId,
            data.to.swapAccount,
            data.to.swapAuthority,
            data.to.swapSource,
            data.to.swapDestination,
            data.to.poolTokenMint,
            data.to.poolFeeAccount,
            data.to.amountIn,
            data.to.minimumAmountOut,
          ),
        );
      }

      if (cleanupInstructions.length > 0) {
        instructions.push(...cleanupInstructions);
      }

      const { signedTransaction } = await createAndSignTransaction(feePayer, instructions, signers);

      return sendTransaction(
        feeRelayerURL,
        '/relay_transaction',
        serializeToRelayTransaction(signedTransaction),
      );
    },
    [createAndSignTransaction, feeRelayerURL, wallet],
  );

  return {
    transfer,
    getUserRelayAccount,
    getUserFreeFeeLimits,
    relayTopUpWithSwap,
    userSetupSwap,
    userSwap,
  };
};

export const { Provider: FeeRelayerProvider, useContainer: useFeeRelayer } =
  createContainer(useFeeRelayerInternal);
