import { Cluster } from '@solana/web3.js';

import { SerializablePool } from 'api/pool/Pool';
import { SerializableToken } from 'api/token/Token';
import { SerializableTokenAccount } from 'api/token/TokenAccount';
import { NetworkType } from 'config/constants';

export type HasEqual<T> = { equals: (other: T) => boolean };

export interface TokenPairState {
  firstTokenAccount?: SerializableTokenAccount;
  firstToken?: SerializableToken;
  firstAmount: number;
  secondTokenAccount?: SerializableTokenAccount;
  secondToken?: SerializableToken;
  secondAmount: number;
  selectedPool?: SerializablePool;
  availablePools: Array<SerializablePool>;
  tokenAccounts: Array<SerializableTokenAccount>;
  poolTokenAccount?: SerializableTokenAccount;
  slippage?: number;
}

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
