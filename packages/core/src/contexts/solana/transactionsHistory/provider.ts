import { useConnectionContext } from '@saberhq/use-solana';
import type { PublicKey, SignaturesForAddressOptions } from '@solana/web3.js';
import { createContainer } from 'unstated-next';

export interface UseTransactionsHistory {}

const useTransactionsHistoryInternal = (): UseTransactionsHistory => {
  const { connection } = useConnectionContext();

  const getTransactions = async (ownerAddress: PublicKey, options: SignaturesForAddressOptions) => {
    const confirmedSignaturesInfos = await connection
      .getSignaturesForAddress(ownerAddress, options, 'confirmed')
      .catch((error: Error) => {
        console.error(`Error getting transaction signatures for ${ownerAddress.toBase58()}`, error);
        throw error;
      });

    if (confirmedSignaturesInfos.length === 0) {
      return [];
    }

    const confirmedSignatures = confirmedSignaturesInfos.map(
      (confirmedSignatureInfo) => confirmedSignatureInfo.signature,
    );

    const parsedTransactions = await connection
      .getParsedConfirmedTransactions(confirmedSignatures)
      .catch((error: Error) => {
        console.error(`Error getting transaction signatures for ${ownerAddress.toBase58()}`, error);
        throw error;
      });

    return [];
    // const transactions = await Promise.all(
    //   parsedTransactions.map((parsedTransaction, index) =>
    //     transactionInfo(confirmedSignatures[index], parsedTransaction),
    //   ),
    // );
    //
    // return transactions.filter(complement(isNil)) as Transaction[];
  };

  return {};
};

export const { Provider: TransactionsHistoryProvider, useContainer: useTransactionsHistory } =
  createContainer(useTransactionsHistoryInternal);
