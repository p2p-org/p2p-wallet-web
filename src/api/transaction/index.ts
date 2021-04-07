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
import { Token } from 'api/token/Token';
import { TokenAccount } from 'api/token/TokenAccount';
import { localSwapProgramId } from 'config/constants';
import { SYSTEM_PROGRAM_ID, TOKEN_PROGRAM_ID } from 'constants/solana/bufferLayouts';
import { CacheTTL } from 'lib/cachettl';
import { ExtendedCluster } from 'utils/types';

import { Transaction } from './Transaction';

const transactionsCache = new CacheTTL<Transaction>({ ttl: 5000 });

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
          authority: string;
          // create account
          newAccount: string;
          // close account
          account: string;
          mint: string;
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
      let type: string | null = null;
      let source: PublicKey | null = null;
      let sourceTokenAccount: TokenAccount | null = null;
      let sourceToken: Token | null = null;
      let destination: PublicKey | null = null;
      let destinationTokenAccount: TokenAccount | null = null;
      let destinationToken: Token | null = null;
      let sourceAmount = new Decimal(0);
      let destinationAmount = new Decimal(0);

      const innerInstructions = transactionInfo?.meta?.innerInstructions;
      const instructions = transactionInfo?.transaction.message.instructions;
      const accountKeys = transactionInfo?.transaction.message.accountKeys;
      const preBalances = transactionInfo?.meta?.preBalances;
      const preTokenBalances = transactionInfo?.meta?.preTokenBalances;

      // swap contract
      const swapInstructionIndex = instructions.findIndex(
        (inst) =>
          inst.programId.equals(swapProgramId) ||
          inst.programId.toBase58() === '9qvG1zUp8xF1Bi4m6UdRNby1BAAuaDrUxSpv4CmRRMjL' || // main old swap
          inst.programId.toBase58() === 'DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1', // main ocra
      );
      if (swapInstructionIndex && instructions[swapInstructionIndex]) {
        const swapInstruction = instructions[swapInstructionIndex] as PartiallyDecodedInstruction;
        const buf = Buffer.from(bs58.decode(swapInstruction.data));
        const instructionIndex = buf.readUInt8(0);

        const swapInner = innerInstructions?.find((item) => item.index === swapInstructionIndex);
        // swap instruction
        if (instructionIndex === 1 && swapInner) {
          type = 'swap';
          const transfersInstructions = swapInner.instructions.filter(
            (inst: ConfirmedTransaction) => inst?.parsed?.type === 'transfer',
          );
          const sourceInstruction = transfersInstructions[0] as ConfirmedTransaction;
          const destinationInstruction = transfersInstructions[1] as ConfirmedTransaction;
          const sourceInfo = sourceInstruction?.parsed?.info;
          const destinationInfo = destinationInstruction?.parsed?.info;
          const closeInstruction = instructions.find(
            (inst: ConfirmedTransaction) => inst.parsed?.type === 'closeAccount',
          ) as ConfirmedTransaction;

          source = sourceInfo?.source ? new PublicKey(sourceInfo.source) : null;
          destination = destinationInfo?.destination
            ? new PublicKey(destinationInfo.destination)
            : null;

          if (closeInstruction?.parsed) {
            if (closeInstruction.parsed.info.account === source?.toBase58()) {
              source = new PublicKey(closeInstruction.parsed.info.destination);
            }
            if (closeInstruction.parsed.info.account === destination?.toBase58()) {
              destination = new PublicKey(closeInstruction.parsed.info.destination);
            }
          }

          sourceTokenAccount = source ? await tokenAPI.tokenAccountInfo(source) : null;
          destinationTokenAccount = destination
            ? await tokenAPI.tokenAccountInfo(destination)
            : null;

          if (sourceTokenAccount) {
            sourceToken = sourceTokenAccount.mint;
          } else if (source && sourceInfo?.destination) {
            const tokenAccount = await tokenAPI.tokenAccountInfo(
              new PublicKey(sourceInfo?.destination),
            );
            if (tokenAccount) {
              sourceToken = tokenAccount.mint;
              sourceTokenAccount = new TokenAccount(
                sourceToken,
                new PublicKey(sourceInfo?.owner),
                TOKEN_PROGRAM_ID,
                source,
                0,
              );
            }
          }
          if (destinationTokenAccount) {
            destinationToken = destinationTokenAccount.mint;
          } else if (destination && destinationInfo?.source) {
            const tokenAccount = await tokenAPI.tokenAccountInfo(
              new PublicKey(destinationInfo?.source),
            );
            if (tokenAccount) {
              destinationToken = tokenAccount.mint;
              destinationTokenAccount = new TokenAccount(
                destinationToken,
                new PublicKey(destinationInfo?.owner),
                TOKEN_PROGRAM_ID,
                destination,
                0,
              );
            }
          }

          sourceAmount = new Decimal(sourceInfo?.amount || 0);
          destinationAmount = new Decimal(destinationInfo?.amount || 0);

          if (sourceToken?.decimals) {
            sourceAmount = sourceAmount.div(10 ** sourceToken?.decimals);
          }
          if (destinationToken?.decimals) {
            destinationAmount = destinationAmount.div(10 ** destinationToken?.decimals);
          }
        }
      } else {
        const instruction = instructions[0] as ConfirmedTransaction;
        const info = instruction?.parsed?.info;

        type = instruction?.parsed?.type || null;
        source = info?.source ? new PublicKey(info?.source) : null;
        sourceTokenAccount = source ? await tokenAPI.tokenAccountInfo(source) : null;

        if (type === 'createAccount') {
          const initializeAccountInstruction = instructions[1] as ConfirmedTransaction;
          const initializeAccountInfo = initializeAccountInstruction.parsed?.info;

          source = info?.source ? new PublicKey(info?.source) : null;
          sourceTokenAccount = source ? await tokenAPI.tokenAccountInfo(source) : null;
          sourceAmount = new Decimal(info?.lamports || 0).div(LAMPORTS_PER_SOL);

          destination = info?.newAccount ? new PublicKey(info?.newAccount) : null;
          if (initializeAccountInfo?.mint && destination) {
            const mint = await tokenAPI.tokenInfo(new PublicKey(initializeAccountInfo?.mint));
            destinationTokenAccount = new TokenAccount(
              mint,
              new PublicKey(initializeAccountInfo?.owner),
              TOKEN_PROGRAM_ID,
              destination,
              0,
            );
          }
          destinationAmount = new Decimal(info?.lamports || 0).div(LAMPORTS_PER_SOL);
        } else if (type === 'closeAccount' && preTokenBalances) {
          const preToken = preTokenBalances[0];
          const preBalance = preBalances?.[1];

          source = info?.account ? new PublicKey(info?.account) : null;
          if (info?.owner && source && preToken) {
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
          destination = info?.destination ? new PublicKey(info?.destination) : null;
          sourceTokenAccount = source ? await tokenAPI.tokenAccountInfo(source) : null;
          destinationTokenAccount = destination
            ? await tokenAPI.tokenAccountInfo(destination)
            : null;

          if (accountKeys && preTokenBalances && info?.authority) {
            if (destination && !destinationTokenAccount) {
              const accountIndex = accountKeys.findIndex(
                (account) => destination && account.pubkey.equals(destination),
              );
              const accountMint = preTokenBalances.find(
                (account) => account.accountIndex === accountIndex,
              );

              if (accountMint?.mint && destination) {
                const mint = await tokenAPI.tokenInfo(new PublicKey(accountMint?.mint));
                destinationTokenAccount = new TokenAccount(
                  mint,
                  new PublicKey(info.authority),
                  TOKEN_PROGRAM_ID,
                  destination,
                  0,
                );
              }
            }

            if (source && !sourceTokenAccount && accountKeys && preTokenBalances) {
              const accountIndex = accountKeys.findIndex(
                (account) => source && account.pubkey.equals(source),
              );
              const accountMint = preTokenBalances.find(
                (account) => account.accountIndex === accountIndex,
              );

              if (accountMint?.mint && source) {
                const mint = await tokenAPI.tokenInfo(new PublicKey(accountMint?.mint));
                destinationTokenAccount = new TokenAccount(
                  mint,
                  new PublicKey(info.authority),
                  TOKEN_PROGRAM_ID,
                  source,
                  0,
                );
              }
            }
          }

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

      sourceToken = sourceToken || sourceTokenAccount?.mint || null;
      destinationToken = destinationToken || destinationTokenAccount?.mint || null;

      // console.log(111, transactionInfo, {
      //   type,
      //   source: source?.toBase58(),
      //   sourceTokenAccount: sourceTokenAccount?.serialize(),
      //   sourceToken: sourceToken?.serialize(),
      //   destination: destination?.toBase58(),
      //   destinationTokenAccount: destinationTokenAccount?.serialize(),
      //   destinationToken: destinationToken?.serialize(),
      //   sourceAmount: sourceAmount.toNumber(),
      //   destinationAmount: destinationAmount.toNumber(),
      // });

      return {
        type,
        source,
        sourceTokenAccount,
        sourceToken,
        destination,
        destinationTokenAccount,
        destinationToken,
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
     * @param parsedTransaction
     */
    const transactionInfo = async (
      signature: TransactionSignature,
      parsedTransaction: ParsedConfirmedTransaction | null = null,
    ): Promise<Transaction | null> => {
      // try to get cached version
      const transactionCached = transactionsCache.get(signature);
      if (transactionCached) {
        return transactionCached;
      }

      const transactionUncached = await transactionInfoUncached(signature, parsedTransaction);

      if (!transactionUncached) {
        return null;
      }

      // set cache
      transactionsCache.set(signature, transactionUncached);

      return transactionUncached;
    };

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

      const parsedTransactions = await connection
        .getParsedConfirmedTransactions(confirmedSignatures)
        .catch((error: Error) => {
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
