import { ExtendedCluster } from './types';

const SOLANA_BASE_URL = 'https://explorer.solana.com/';

export const getExplorerUrl = (type = 'tx', address: string, cluster: ExtendedCluster): string => {
  const baseUrlWithAddress = `${SOLANA_BASE_URL}${type}/${address}`;
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      return `${baseUrlWithAddress}?cluster=${cluster}`;
    default:
      return baseUrlWithAddress;
  }
};
