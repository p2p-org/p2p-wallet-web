import cache from '@civic/simple-cache';
import {
  ConfirmedSignaturesForAddress2Options,
  LAMPORTS_PER_SOL,
  ParsedAccountData,
  ParsedInstruction,
  PublicKey,
  TransactionSignature,
} from '@solana/web3.js';
import { Decimal } from 'decimal.js';
import { complement, identity, isNil, memoizeWith } from 'ramda';

import { getConnection } from 'api/connection';
import { APIFactory as TokenAPIFactory } from 'api/token';
import { SYSTEM_PROGRAM_ID, TOKEN_PROGRAM_ID } from 'constants/solana/bufferLayouts';
import { ExtendedCluster } from 'utils/types';

import { Transaction } from './Transaction';

export interface API {
  transactionInfo: (signature: TransactionSignature) => Promise<Transaction | null>;
  getTransactionsForAddress: (
    account: PublicKey,
    options: ConfirmedSignaturesForAddress2Options,
  ) => Promise<Transaction[]>;
}

// The API is a singleton per cluster. This ensures requests can be cached
export const APIFactory = memoizeWith(
  identity,
  (cluster: ExtendedCluster): API => {
    const connection = getConnection(cluster);
    const tokenAPI = TokenAPIFactory(cluster);

    const transactionInfoUncached = async (
      signature: TransactionSignature,
    ): Promise<Transaction | null> => {
      console.log('Getting info for', signature);

      const transactionInfo = await connection
        .getParsedConfirmedTransaction(signature)
        .catch((error) => {
          console.error(`Error getting details for ${signature}`, error);
          throw error;
        });

      if (!transactionInfo) {
        return null;
      }

      const meta = transactionInfo.meta
        ? {
            err: transactionInfo.meta.err,
            fee: transactionInfo.meta.fee,
          }
        : null;

      const instruction = transactionInfo?.transaction.message.instructions[0];
      const source = instruction?.parsed?.info.source
        ? new PublicKey(instruction?.parsed?.info.source)
        : null;
      const sourceTokenAccount = source ? await tokenAPI.tokenAccountInfo(source) : null;
      const type = instruction?.parsed?.type;

      let amount = new Decimal(0);
      if (instruction?.programId.equals(TOKEN_PROGRAM_ID)) {
        amount = new Decimal(instruction?.parsed?.info.amount || 0);

        if (sourceTokenAccount?.mint.decimals) {
          amount = new Decimal(amount).div(10 ** sourceTokenAccount?.mint.decimals);
        }
      } else if (instruction?.programId.equals(SYSTEM_PROGRAM_ID)) {
        amount = new Decimal(instruction?.parsed?.info.lamports || 0).div(LAMPORTS_PER_SOL);
      }

      const timestamp = await connection.getBlockTime(transactionInfo.slot);

      return new Transaction(
        signature,
        transactionInfo.slot,
        timestamp,
        meta,
        transactionInfo.transaction.message,
        { type, source, sourceTokenAccount, amount },
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
      options: ConfirmedSignaturesForAddress2Options,
    ): Promise<Transaction[]> => {
      console.log('Get transactions for the address', {
        account: account.toBase58(),
      });

      const confirmedSignatures = await connection
        .getConfirmedSignaturesForAddress2(account, options)
        .catch((error) => {
          console.error(`Error getting transaction signatures for ${account.toBase58()}`, error);
          throw error;
        });

      const transactions = await Promise.all(
        confirmedSignatures.map((signatureResult) => transactionInfo(signatureResult.signature)),
      );

      return transactions.filter(complement(isNil)) as Transaction[];
    };

    return {
      transactionInfo,
      getTransactionsForAddress,
    };
  },
);
