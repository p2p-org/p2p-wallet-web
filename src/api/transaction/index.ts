import cache from '@civic/simple-cache';
import {
  ConfirmedSignaturesForAddress2Options,
  LAMPORTS_PER_SOL,
  ParsedConfirmedTransaction,
  PartiallyDecodedInstruction,
  PublicKey,
  TransactionSignature,
} from '@solana/web3.js';
import bs58 from 'bs58';
import { Decimal } from 'decimal.js';
import { complement, identity, isNil, memoizeWith } from 'ramda';

import { getConnection } from 'api/connection';
import poolConfig from 'api/pool/pool.config';
import { APIFactory as TokenAPIFactory } from 'api/token';
import { TokenAccount } from 'api/token/TokenAccount';
import { localSwapProgramId } from 'config/constants';
import { SYSTEM_PROGRAM_ID, TOKEN_PROGRAM_ID } from 'constants/solana/bufferLayouts';
import { ExtendedCluster } from 'utils/types';

import { Transaction } from './Transaction';

export interface API {
  transactionInfo: (
    signature: TransactionSignature,
    parsedTransaction?: ParsedConfirmedTransaction | null,
  ) => Promise<Transaction | null>;
  getTransactionsForAddress: (
    account: PublicKey,
    options?: ConfirmedSignaturesForAddress2Options,
  ) => Promise<Transaction[]>;
}

// The API is a singleton per cluster. This ensures requests can be cached
export const APIFactory = memoizeWith(
  identity,
  (cluster: ExtendedCluster): API => {
    const connection = getConnection(cluster);
    const tokenAPI = TokenAPIFactory(cluster);
    const poolConfigForCluster = poolConfig[cluster];

    const swapProgramId = poolConfigForCluster.swapProgramId || localSwapProgramId;
    if (!swapProgramId) {
      throw new Error('No TokenSwap program ID defined');
    }

    console.log(`Swap Program ID ${swapProgramId.toBase58()}.`);

    type ConfirmedTransaction = {
      programId: PublicKey;
      data?: string;
      parsed?: {
        info: {
          owner: string;
          // transfer spl
          source: string;
          destination: string;
          amount: number;
          // transfer sys
          lamports: number;
          // create account
          newAccount: string;
          // close account
          account: string;
        };
        type: string;
      };
    };

    // Receive
    // Transfer
    // Swap // to
    // Swap // from
    // Create Account
    // Close Account
    const makeTransactionShortInfo = async (transactionInfo: ParsedConfirmedTransaction) => {
      console.log(222, transactionInfo);

      let type: string | null = null;
      let source: PublicKey | null = null;
      let sourceTokenAccount: TokenAccount | null = null;
      let destination: PublicKey | null = null;
      let destinationTokenAccount: TokenAccount | null = null;
      let sourceAmount = new Decimal(0);
      let destinationAmount = new Decimal(0);

      const innerInstructions = transactionInfo?.meta?.innerInstructions?.[0]?.instructions;
      const instructions = transactionInfo?.transaction.message.instructions;
      const preBalances = transactionInfo?.meta?.preBalances;
      const preTokenBalances = transactionInfo?.meta?.preTokenBalances;

      // swap contract
      const swapInstruction = instructions.find((inst) => inst.programId.equals(swapProgramId)) as
        | PartiallyDecodedInstruction
        | undefined;
      if (swapInstruction) {
        const buf = Buffer.from(bs58.decode(swapInstruction.data));
        const index = buf.readUInt8(0);

        // swap instruction
        if (index === 1 && innerInstructions?.[0] && innerInstructions?.[1]) {
          type = 'swap';
          const sourceInstruction = innerInstructions[0] as ConfirmedTransaction;
          const destinationInstruction = innerInstructions[1] as ConfirmedTransaction;
          const sourceInfo = sourceInstruction?.parsed?.info;
          const destinationInfo = destinationInstruction?.parsed?.info;

          source = sourceInfo?.source ? new PublicKey(sourceInfo.source) : null;
          destination = destinationInfo?.destination
            ? new PublicKey(destinationInfo.destination)
            : null;
          sourceTokenAccount = source ? await tokenAPI.tokenAccountInfo(source) : null;
          destinationTokenAccount = destination
            ? await tokenAPI.tokenAccountInfo(destination)
            : null;

          sourceAmount = new Decimal(sourceInfo?.amount || 0);
          destinationAmount = new Decimal(destinationInfo?.amount || 0);

          if (sourceTokenAccount?.mint.decimals) {
            sourceAmount = sourceAmount.div(10 ** sourceTokenAccount?.mint.decimals);
          }
          if (destinationTokenAccount?.mint.decimals) {
            destinationAmount = destinationAmount.div(10 ** destinationTokenAccount?.mint.decimals);
          }
        }
      } else {
        const instruction = instructions[0] as ConfirmedTransaction;
        const info = instruction?.parsed?.info;

        type = instruction?.parsed?.type || null;
        source = info?.source ? new PublicKey(info?.source) : null;
        sourceTokenAccount = source ? await tokenAPI.tokenAccountInfo(source) : null;

        if (type === 'createAccount') {
          source = info?.source ? new PublicKey(info?.source) : null;
          sourceTokenAccount = source ? await tokenAPI.tokenAccountInfo(source) : null;
          sourceAmount = new Decimal(info?.lamports || 0).div(LAMPORTS_PER_SOL);
          destination = info?.newAccount ? new PublicKey(info?.newAccount) : null;
          destinationTokenAccount = destination
            ? await tokenAPI.tokenAccountInfo(destination)
            : null;
          destinationAmount = new Decimal(info?.lamports || 0).div(LAMPORTS_PER_SOL);
        } else if (type === 'closeAccount' && preTokenBalances) {
          const preToken = preTokenBalances[0];
          const preBalance = preBalances?.[1];

          source = info?.account ? new PublicKey(info?.account) : null;
          if (info?.owner && source) {
            const mint = await tokenAPI.tokenInfo(new PublicKey(preToken.mint));
            sourceTokenAccount = new TokenAccount(
              mint,
              new PublicKey(info?.owner),
              TOKEN_PROGRAM_ID,
              source,
              0,
            );
          }
          destination = info?.destination ? new PublicKey(info?.destination) : null;
          destinationTokenAccount = destination
            ? await tokenAPI.tokenAccountInfo(destination)
            : null;
          destinationAmount = new Decimal(preBalance || 0).div(LAMPORTS_PER_SOL);
        } else {
          source = info?.source ? new PublicKey(info?.source) : null;
          sourceTokenAccount = source ? await tokenAPI.tokenAccountInfo(source) : null;
          destination = info?.destination ? new PublicKey(info?.destination) : null;
          destinationTokenAccount = destination
            ? await tokenAPI.tokenAccountInfo(destination)
            : null;

          if (instruction?.programId.equals(TOKEN_PROGRAM_ID)) {
            sourceAmount = new Decimal(info?.amount || 0);
            destinationAmount = new Decimal(info?.amount || 0);

            if (sourceTokenAccount?.mint.decimals) {
              sourceAmount = sourceAmount.div(10 ** sourceTokenAccount?.mint.decimals);
            }
            if (destinationTokenAccount?.mint.decimals) {
              destinationAmount = destinationAmount.div(
                10 ** destinationTokenAccount?.mint.decimals,
              );
            }
          } else if (instruction?.programId.equals(SYSTEM_PROGRAM_ID)) {
            sourceAmount = new Decimal(info?.lamports || 0).div(LAMPORTS_PER_SOL);
            destinationAmount = new Decimal(info?.lamports || 0).div(LAMPORTS_PER_SOL);
          }
        }
      }

      return {
        type,
        source,
        sourceTokenAccount,
        destination,
        destinationTokenAccount,
        sourceAmount,
        destinationAmount,
      };
    };

    const transactionInfoUncached = async (
      signature: TransactionSignature,
      parsedTransaction: ParsedConfirmedTransaction | null = null,
    ): Promise<Transaction | null> => {
      console.log('Getting info for', signature);

      let transactionInfo = parsedTransaction;
      if (!transactionInfo) {
        transactionInfo = await connection
          .getParsedConfirmedTransaction(signature)
          .catch((error) => {
            console.error(`Error getting details for transaction ${signature}`, error);
            throw error;
          });
      }

      if (!transactionInfo) {
        return null;
      }

      const meta = transactionInfo.meta
        ? {
            err: transactionInfo.meta.err,
            fee: transactionInfo.meta.fee,
          }
        : null;

      const shortTransactionInfo = await makeTransactionShortInfo(transactionInfo);

      return new Transaction(
        signature,
        transactionInfo.slot,
        transactionInfo.blockTime,
        meta,
        transactionInfo.transaction.message,
        shortTransactionInfo,
      );
    };

    /**
     * Given a signature, return its transaction information
     * @param signature
     */
    const transactionInfo = cache(transactionInfoUncached, { ttl: 5000 });

    /**
     * Get transactions for a address
     * @param publicKey
     */
    const getTransactionsForAddress = async (
      account: PublicKey,
      options?: ConfirmedSignaturesForAddress2Options,
    ): Promise<Transaction[]> => {
      console.log('Get transactions for the address', {
        account: account.toBase58(),
      });

      const confirmedSignaturesInfos = await connection
        .getConfirmedSignaturesForAddress2(account, options)
        .catch((error: Error) => {
          console.error(`Error getting transaction signatures for ${account.toBase58()}`, error);
          throw error;
        });

      const confirmedSignatures = confirmedSignaturesInfos.map(
        (confirmedSignaturesInfo) => confirmedSignaturesInfo.signature,
      );

      if (confirmedSignatures.length === 0) {
        return [];
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      const parsedTransactions = await connection
        .getParsedConfirmedTransactions(confirmedSignatures)
        .catch((error) => {
          console.error(`Error getting transaction signatures for ${account.toBase58()}`, error);
          throw error;
        });

      const transactions = await Promise.all(
        parsedTransactions.map((parsedTransaction, index) =>
          transactionInfo(confirmedSignatures[index], parsedTransaction),
        ),
      );

      return transactions.filter(complement(isNil)) as Transaction[];
    };

    return {
      transactionInfo,
      getTransactionsForAddress,
    };
  },
);
