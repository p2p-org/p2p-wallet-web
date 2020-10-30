import * as web3 from '@solana/web3.js';

export const NETWORKS = [
  { name: 'mainnet-beta', endpoint: web3.clusterApiUrl('mainnet-beta') },
  { name: 'testnet', endpoint: web3.clusterApiUrl('testnet') },
  { name: 'devnet', endpoint: web3.clusterApiUrl('devnet') },
  { name: 'localnet', endpoint: 'http://localhost:8899' },
];
