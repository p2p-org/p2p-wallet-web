import type {
  Account,
  Blockhash,
  Commitment,
  Connection,
  FeeCalculator,
  PublicKey,
  TransactionInstruction,
  TransactionInstructionCtorFields,
} from '@solana/web3.js';
import { Transaction } from '@solana/web3.js';

import { postTransactionSleepMS } from 'config/constants';
import { sleep } from 'utils/common';
import type { SendTransactionError } from 'utils/errors';
import { parseSendTransactionError } from 'utils/errors';

import { confirmTransaction, DEFAULT_COMMITMENT } from '../connection';
import type { ManualWalletData } from './ManualWallet/ManualWallet';
import type { Wallet } from './Wallet';
import { WalletEvent } from './Wallet';

const POST_TRANSACTION_SLEEP_MS = postTransactionSleepMS || 500;

/**
 * API for connecting to and interacting with a wallet
 */

// singleton wallet for the app.
// A user can be connected to only one wallet at a time.
let wallet: Wallet | null;
let connection: Connection | null;

export enum WalletType {
  // eslint-disable-next-line no-unused-vars
  LOCAL,
  // eslint-disable-next-line no-unused-vars
  MANUAL,
  // eslint-disable-next-line no-unused-vars
  SOLLET,
  // eslint-disable-next-line no-unused-vars
  PHANTOM,
}

export type WalletDataType = ManualWalletData;

export const makeTransaction = async (
  instructions: (TransactionInstruction | TransactionInstructionCtorFields)[],
  signers: Account[] = [],
): Promise<Transaction> => {
  if (!wallet || !connection) {
    throw new Error('Connect first');
  }

  const { blockhash: recentBlockhash } = await connection.getRecentBlockhash();

  const transaction = new Transaction({
    recentBlockhash,
  });
  transaction.add(...instructions);
  transaction.setSigners(wallet.pubkey, ...signers.map((s) => s.publicKey));

  // if there are any cosigners (other than the current wallet)
  // sign the transaction
  if (signers.length > 0) {
    transaction.partialSign(...signers);
  }

  return transaction;
};

type SendOptions = {
  commitment: Commitment;
  preflightCommitment: Commitment;
};

const defaultSendOptions = {
  commitment: DEFAULT_COMMITMENT,
  preflightCommitment: DEFAULT_COMMITMENT,
};

export async function awaitConfirmation(
  signature: string,
  commitment: Commitment = DEFAULT_COMMITMENT,
) {
  console.log(`Submitted transaction ${signature}, awaiting confirmation`);
  await confirmTransaction(signature, commitment);
  console.log(`Transaction ${signature} confirmed`);

  if (wallet) {
    wallet.emit(WalletEvent.CONFIRMED, { transactionSignature: signature });
  }

  // workaround for a known blockchain web3 bug where
  // the state obtained from the http endpoint and the websocket are out of sync
  await sleep(POST_TRANSACTION_SLEEP_MS);
  return signature;
}

export const sendTransaction = async (
  transaction: Transaction,
  awaitConfirm = true,
  {
    commitment = defaultSendOptions.commitment,
    preflightCommitment = defaultSendOptions.preflightCommitment,
  }: Partial<SendOptions> = defaultSendOptions,
): Promise<string> => {
  if (!wallet || !connection) {
    throw new Error('Connect first');
  }

  console.log('Sending signature request to wallet');
  const signed = await wallet.sign(transaction);
  console.log('Got signature, submitting transaction');

  try {
    const signature = await connection.sendRawTransaction(signed.serialize(), {
      preflightCommitment,
    });

    if (awaitConfirm) {
      return await awaitConfirmation(signature, commitment);
    }

    return signature;
  } catch (error) {
    if ((error as SendTransactionError).logs) {
      const errors = parseSendTransactionError(error as SendTransactionError);
      throw new Error(errors.join(' '));
    }

    throw error;
  }
};

export const getWallet = (): Wallet => {
  if (!wallet || !connection) {
    throw new Error('Did not have wallet');
  }

  return wallet;
};

export const getWalletUnsafe = (): Wallet | null => {
  return wallet;
};

export const getBalance = (publicKey: PublicKey): Promise<number> => {
  if (!connection) {
    throw new Error('Connect first');
  }

  return connection.getBalance(publicKey);
};

export const getMinimumBalanceForRentExemption = (length: number): Promise<number> => {
  if (!wallet || !connection) {
    throw new Error('Connect first');
  }

  return connection.getMinimumBalanceForRentExemption(length);
};

export const getRecentBlockhash = (): Promise<{
  blockhash: Blockhash;
  feeCalculator: FeeCalculator;
}> => {
  if (!wallet || !connection) {
    throw new Error('Connect first');
  }

  return connection.getRecentBlockhash();
};
