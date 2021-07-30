import { clusterApiUrl, Commitment, HttpHeaders, PublicKey } from '@solana/web3.js';

import { ExtendedCluster } from 'utils/types';

export const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

// Can be used in development mode only
export const localPrivateKey = isDev && process.env.REACT_APP_APP_LOCAL_WALLET_PRIVATE_KEY;

export const localMnemonic = isDev && process.env.REACT_APP_APP_LOCAL_WALLET_MNEMONIC;

export const swapHostFeeAddress = process.env.REACT_APP_SWAP_HOST_FEE_ADDRESS
  ? new PublicKey(process.env.REACT_APP_SWAP_HOST_FEE_ADDRESS)
  : null;

export const cryptoCompareApiKey = process.env.REACT_APP_CRYPTO_COMPARE_API_KEY;

// the default commitment uesd by the Solana web3 connection when checking the blockchain state
export const defaultCommitment: Commitment =
  (process.env.REACT_APP_DEFAULT_COMMITMENT as Commitment) || 'confirmed';

// the amount of time to sleep after sending a transaction
// in order to work around a known solana web3 bug
export const postTransactionSleepMS = Number(process.env.REACT_APP_POST_TRANSACTION_SLEEP_MS);

export type NetworkType = {
  name: string;
  cluster: ExtendedCluster;
  endpoint: string;
  endpointLabel?: string;
  wsEndpoint?: string;
  wsEndpointLabel?: string;
  httpHeaders?: HttpHeaders;
};

export type NetworkNameType =
  | 'serum-mainnet'
  | 'free-rpcpool'
  | 'solana-mainnet'
  | 'solana-devnet'
  | 'solana-testnet';

type NetworksByNameType = {
  [name in NetworkNameType]: NetworkType;
};

export const networks: NetworksByNameType = {
  'serum-mainnet': {
    name: 'serum-mainnet',
    cluster: 'mainnet-beta',
    endpoint: 'https://solana-api.projectserum.com',
  },
  'free-rpcpool': {
    name: 'free-rpcpool',
    cluster: 'mainnet-beta',
    endpoint: 'https://free.rpcpool.com',
  },
  'solana-mainnet': {
    name: 'solana-mainnet',
    cluster: 'mainnet-beta',
    endpoint: clusterApiUrl('mainnet-beta'),
  },
  'solana-devnet': {
    name: 'solana-devnet',
    cluster: 'devnet',
    endpoint: clusterApiUrl('devnet'),
  },
  'solana-testnet': {
    name: 'solana-testnet',
    cluster: 'testnet',
    endpoint: clusterApiUrl('testnet'),
  },
};

export const DEFAULT_NETWORK: NetworkType = networks['serum-mainnet'];

export const feeRelayerUrl = process.env.REACT_APP_FEE_RELAYER_URL;
