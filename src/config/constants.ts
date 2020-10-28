import * as web3 from '@solana/web3.js';

export const NETWORKS = [
  { name: 'mainnet-beta', url: web3.clusterApiUrl('mainnet-beta') },
  { name: 'testnet', url: web3.clusterApiUrl('testnet') },
  { name: 'devnet', url: web3.clusterApiUrl('devnet') },
  { name: 'local', url: 'http://localhost:8899' },
];
