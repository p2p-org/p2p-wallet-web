import type { Cluster } from '@solana/web3.js';

import type { NetworkType } from 'config/constants';

export type HasEqual<T> = { equals: (other: T) => boolean };

// Web3 does not recognise "localnet" as a cluster
export type ExtendedCluster = Cluster;

export interface Serializable<T> {
  serialize(): T;
}

export type WalletSettings = {
  currency: string;
  appearance: string;
  network: NetworkType;
  isZeroBalancesHidden: boolean;
  useFreeTransactions: boolean;
};
