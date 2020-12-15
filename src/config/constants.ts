import { Commitment, PublicKey } from '@solana/web3.js';

import { ExtendedCluster } from 'utils/types';

export const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

// Can be used in development mode only
export const localPrivateKey = isDev && process.env.APP_LOCAL_WALLET_PRIVATE_KEY;

export const localMnemonic = isDev && process.env.APP_LOCAL_WALLET_MNEMONIC;

// Env vars that do not start with "REACT_APP_" are available in tests only
export const localSwapProgramId = process.env.SWAP_PROGRAM_ID
  ? new PublicKey(process.env.SWAP_PROGRAM_ID)
  : null;

// the default commitment uesd by the Solana web3 connection when checking the blockchain state
export const defaultCommitment: Commitment =
  (process.env.DEFAULT_COMMITMENT as Commitment) || 'singleGossip';

// the amount of time to sleep after sending a transaction
// in order to work around a known solana web3 bug
export const postTransactionSleepMS = Number(process.env.POST_TRANSACTION_SLEEP_MS);

export const airdropKey = (cluster: ExtendedCluster): string | undefined =>
  process.env[`APP_${cluster.toUpperCase()}_AIRDROP_PRIVATE_KEY`];

export const CLUSTERS = ['mainnet-beta', 'testnet', 'devnet', 'localnet'];
