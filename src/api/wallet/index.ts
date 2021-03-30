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

import { postTransactionSleepMS } from 'config/constants';
import { sleep } from 'utils/common';
import { ExtendedCluster } from 'utils/types';

import { confirmTransaction, DEFAULT_COMMITMENT, getConnection, getNetwork } from '../connection';
import { LocalWallet } from './LocalWallet';
import { ManualWallet, ManualWalletData } from './ManualWallet';
import { SolletWallet } from './SolletWallet';
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
  MANUAL,
  SOLLET,
  BONFIDA,
  LOCAL,
}

export type WalletDataType = ManualWalletData;

const createWallet = (
  type: WalletType,
  cluster: ExtendedCluster,
  data?: WalletDataType,
): Wallet => {
  const network = getNetwork(cluster);
  switch (type) {
    case WalletType.LOCAL:
      return new LocalWallet(network);
    case WalletType.SOLLET:
      return new SolletWallet(network);
    case WalletType.BONFIDA:
      return new SolletWallet(network, 'https://bonfida.com/wallet');
    case WalletType.MANUAL:
    default:
      return new ManualWallet(network, data);
  }
};

export const connect = async (
  cluster: ExtendedCluster,
  type: WalletType,
  data?: WalletDataType,
): Promise<Wallet> => {
  const newWallet = createWallet(type, cluster, data);

  // assign the singleton wallet.
  // Using a separate variable to simplify the type definitions
  wallet = newWallet;
  connection = getConnection(cluster);

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

async function awaitConfirmation(signature: string, commitment: Commitment | undefined) {
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
  const signature = await connection.sendRawTransaction(signed.serialize(), {
    preflightCommitment,
  });

  return awaitConfirmation(signature, commitment);
};

export const sendTransactionFromAccount = async (
  transaction: Transaction,
  signer: Account,
  {
    commitment = defaultSendOptions.commitment,
    preflightCommitment = defaultSendOptions.preflightCommitment,
  }: Partial<SendOptions> = defaultSendOptions,
): Promise<string> => {
  if (!wallet || !connection) {
    throw new Error('Connect first');
  }

  const signature = await connection.sendTransaction(transaction, [signer], {
    preflightCommitment,
  });

  return awaitConfirmation(signature, commitment);
};

export const getWallet = (): Wallet => {
  if (!wallet || !connection) {
    throw new Error('notification.error.noWallet');
  }

  return wallet;
};

export const airdropTo = (publicKey: PublicKey): Promise<string> => {
  if (!wallet || !connection) {
    throw new Error('Connect first');
  }

  return connection.requestAirdrop(publicKey, 100000000);
};

export const getBalance = (publicKey: PublicKey): Promise<number> => {
  if (!wallet || !connection) {
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
