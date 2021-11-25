import { useMemo } from 'react';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import type { Cluster, ConnectionConfig } from '@solana/web3.js';
import { clusterApiUrl, Connection } from '@solana/web3.js';
import { createContainer } from 'unstated-next';

interface UseConnection {
  cluster: Cluster;
  connection: Connection;
}

interface UseConnectionArgs {
  config?: ConnectionConfig;
}

const useConnectionInternal = ({
  config = { commitment: 'confirmed' },
}: UseConnectionArgs = {}): UseConnection => {
  const cluster = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(cluster), [cluster]);

  const connection = useMemo(() => new Connection(endpoint, config), [endpoint, config]);

  return {
    cluster,
    connection,
  };
};

export const { Provider: ConnectionProvider, useContainer: useConnection } =
  createContainer(useConnectionInternal);
