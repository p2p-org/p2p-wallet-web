import type { Network } from '@saberhq/solana-contrib';

const SOLANA_BASE_URL = 'https://explorer.solana.com/';

export const getExplorerUrl = (type = 'tx', address: string, cluster: Network): string => {
  const baseUrlWithAddress = `${SOLANA_BASE_URL}${type}/${address}`;
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      return `${baseUrlWithAddress}?cluster=${cluster}`;
    default:
      return baseUrlWithAddress;
  }
};
