import {
  Account,
  Blockhash,
  Commitment,
  Connection,
  FeeCalculator,
  PublicKey,
  Transaction,
  TransactionInstruction,
  TransactionInstructionCtorFields,
} from '@solana/web3.js';
import assert from 'assert';

import { PhantomtWallet } from 'api/wallet/PhantomWallet';
import { NetworkType, postTransactionSleepMS } from 'config/constants';
import { sleep } from 'utils/common';
import { parseSendTransactionError, SendTransactionError } from 'utils/errors';

import { confirmTransaction, DEFAULT_COMMITMENT, getConnection, getEndpoint } from '../connection';
import { LocalWallet } from './LocalWallet';
import { ManualWallet, ManualWalletData } from './ManualWallet/ManualWallet';
import { DEFAULT_SOLLET_PROVIDER, SolletWallet } from './SolletWallet';
import { Wallet, WalletEvent } from './Wallet';

const POST_TRANSACTION_SLEEP_MS = postTransactionSleepMS || 500;

/**
 * API for connecting to and interacting with a wallet
 */

// singleton wallet for the app.
// A user can be connected to only one wallet at a time.
let wallet: Wallet | null;
let connection: Connection | null;

// eslint-disable-next-line no-shadow
export enum WalletType {
  LOCAL,
  MANUAL,
  SOLLET,
  SOLLET_EXTENSION,
  PHANTOM,
}

export type WalletDataType = ManualWalletData;

const createWallet = (type: WalletType, network: NetworkType, data?: WalletDataType): Wallet => {
  const endpoint = getEndpoint(network);
  switch (type) {
    case WalletType.LOCAL:
      return new LocalWallet(endpoint);
    case WalletType.SOLLET_EXTENSION:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-explicit-any
      return new SolletWallet(endpoint, (window as any).sollet);
    case WalletType.SOLLET:
      return new SolletWallet(endpoint, DEFAULT_SOLLET_PROVIDER);
    case WalletType.PHANTOM:
      return new PhantomtWallet(endpoint);
    case WalletType.MANUAL:
    default:
      assert(data, 'Wallet data must be exists');
      return new ManualWallet(endpoint, data);
  }
};

export const connect = (network: NetworkType) => {
  connection = getConnection(network);
};

export const connectWallet = async (
  network: NetworkType,
  type: WalletType,
  data?: WalletDataType,
): Promise<Wallet> => {
  const newWallet = createWallet(type, network, data);

  // assign the singleton wallet.
  // Using a separate variable to simplify the type definitions

  wallet = newWallet;
  connection = getConnection(network);

  // connect is done once the wallet reports that it is connected.
  return new Promise((resolve) => {
    newWallet.on(WalletEvent.CONNECT, () => resolve(newWallet));
  });
};

export const disconnect = (): void => wallet?.disconnect();

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

  // workaround for a known solana web3 bug where
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

export const airdropTo = (publicKey: PublicKey): Promise<string> => {
  if (!wallet || !connection) {
    throw new Error('Connect first');
  }

  return connection.requestAirdrop(publicKey, 100000000);
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

export const airdrop = (): null | Promise<string> => wallet && airdropTo(wallet.pubkey);
