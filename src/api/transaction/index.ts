import cache from '@civic/simple-cache';
import { PublicKey, TransactionSignature } from '@solana/web3.js';
import { complement, identity, isNil, memoizeWith } from 'ramda';

import { getConnection } from 'api/connection';
import { ExtendedCluster } from 'utils/types';

import { Transaction } from './Transaction';

export interface API {
  getTransactionsForAddress: (account: PublicKey) => Promise<Transaction[]>;
}

// The API is a singleton per cluster. This ensures requests can be cached
export const APIFactory = memoizeWith(
  identity,
  (cluster: ExtendedCluster): API => {
    const connection = getConnection(cluster);

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

      return new Transaction(
        signature,
        transactionInfo.slot,
        meta,
        transactionInfo.transaction.message,
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
    const getTransactionsForAddress = async (account: PublicKey): Promise<Transaction[]> => {
      console.log('Get transactions for the address', {
        account: account.toBase58(),
      });

      const allConfirmedSignatures = await connection
        .getConfirmedSignaturesForAddress2(account)
        .catch((error) => {
          console.error(`Error getting transaction signatures for ${account.toBase58()}`, error);
          throw error;
        });

      const allTransactions = await Promise.all(
        allConfirmedSignatures.map((signatureResult) => transactionInfo(signatureResult.signature)),
      );

      return allTransactions.filter(complement(isNil)) as Transaction[];
    };

    return {
      getTransactionsForAddress,
    };
  },
);
