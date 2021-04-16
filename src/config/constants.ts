import { Commitment, PublicKey } from '@solana/web3.js';

import { ExtendedCluster } from 'utils/types';

export const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

// Can be used in development mode only
export const localPrivateKey = isDev && process.env.REACT_APP_APP_LOCAL_WALLET_PRIVATE_KEY;

export const localMnemonic = isDev && process.env.REACT_APP_APP_LOCAL_WALLET_MNEMONIC;

export const swapHostFeeAddress = process.env.REACT_APP_SWAP_HOST_FEE_ADDRESS
  ? new PublicKey(process.env.REACT_APP_SWAP_HOST_FEE_ADDRESS)
  : null;

export const cryptoCompareApiKey = process.env.REACT_APP_CRYPTO_COMPARE_API_KEY;

// Env vars that do not start with "REACT_APP_" are available in tests only
export const localSwapProgramId = process.env.REACT_APP_SWAP_PROGRAM_ID
  ? new PublicKey(process.env.REACT_APP_SWAP_PROGRAM_ID)
  : null;

// the default commitment uesd by the Solana web3 connection when checking the blockchain state
export const defaultCommitment: Commitment =
  (process.env.REACT_APP_DEFAULT_COMMITMENT as Commitment) || 'confirmed';

// the amount of time to sleep after sending a transaction
// in order to work around a known solana web3 bug
export const postTransactionSleepMS = Number(process.env.REACT_APP_POST_TRANSACTION_SLEEP_MS);

export const airdropKey = (cluster: ExtendedCluster): string | undefined =>
  process.env[`REACT_APP_${cluster.toUpperCase()}_AIRDROP_PRIVATE_KEY`];

export const clusters: {
  [cluster: string]: string;
} = {
  'p2p-mainnet': 'https://node-1.solana.p2p.org',
  'serum-mainnet': 'https://solana-api.projectserum.com',
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
  devnet: 'https://devnet.solana.com',
  testnet: 'https://testnet.solana.com',
};
