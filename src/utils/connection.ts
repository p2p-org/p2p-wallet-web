import { Cluster } from '@solana/web3.js';

const SOLANA_BASE_URL = 'https://explorer.solana.com/tx/';

export const getExplorerUrl = (cluster: Cluster, address: string): string => {
  const baseUrlWithAddress = SOLANA_BASE_URL + address;
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      return `${baseUrlWithAddress}?cluster=${cluster}`;
    default:
      return baseUrlWithAddress;
  }
};
