import type { Network } from '@saberhq/solana-contrib';
import type { HttpHeaders } from '@solana/web3.js';
import { clusterApiUrl } from '@solana/web3.js';

import type { featureFlags } from 'config/featureFlags';
import { FEATURE_NETWORKS } from 'config/featureFlags';

export const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

export const localMnemonic = isDev && process.env.REACT_APP_APP_LOCAL_WALLET_MNEMONIC;

export type NetworkObj = {
  name: string;
  network: Network;
  endpoint: string;
  endpointLabel?: string;
  wsEndpoint?: string;
  wsEndpointLabel?: string;
  httpHeaders?: HttpHeaders;
  feature?: keyof typeof featureFlags;
};

export type NetworkNameType =
  | 'serum-mainnet'
  | 'p2p-rpcpool'
  | 'solana-mainnet'
  | 'solana-devnet'
  | 'solana-testnet';

type NetworksByNameType = {
  // eslint-disable-next-line no-unused-vars
  [name in NetworkNameType]: NetworkObj;
};

export const NETWORKS: NetworksByNameType = {
  'p2p-rpcpool': {
    name: 'p2p-rpcpool',
    network: 'mainnet-beta',
    endpoint: 'https://p2p.rpcpool.com/',
  },
  'serum-mainnet': {
    name: 'serum-mainnet',
    network: 'mainnet-beta',
    endpoint: 'https://solana-api.projectserum.com/',
  },
  'solana-mainnet': {
    name: 'solana-mainnet',
    network: 'mainnet-beta',
    endpoint: `${clusterApiUrl('mainnet-beta')}`,
  },
  'solana-devnet': {
    name: 'solana-devnet',
    network: 'devnet',
    feature: FEATURE_NETWORKS,
    endpoint: `${clusterApiUrl('devnet')}`,
  },
  'solana-testnet': {
    name: 'solana-testnet',
    network: 'testnet',
    feature: FEATURE_NETWORKS,
    endpoint: `${clusterApiUrl('testnet')}`,
  },
};

export const feeRelayerUrl = process.env.REACT_APP_FEE_RELAYER_URL;

export const appStorePath = 'https://testflight.apple.com/join/hxaQVX0E';
export const playStorePath = 'https://play.google.com/store/apps/details?id=org.p2p.wallet';

export const SENTRY_DSN_ENDPOINT = process.env.REACT_APP_SENTRY_DSN_ENDPOINT;
export const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT;
export const SENTRY_TRACES_SAMPLE_RATE = process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE;
export const SENTRY_RELEASE = process.env.REACT_APP_SENTRY_RELEASE;
