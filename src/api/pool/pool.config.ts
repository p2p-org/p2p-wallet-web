import { PublicKey } from '@solana/web3.js';

export type PoolConfig = {
  swapProgramId: PublicKey | null;
};

type PoolsByEntrypointType = {
  [cluster: string]: PoolConfig;
};

const swapProgramId = new PublicKey('DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1');

// eslint-disable-next-line import/no-default-export
export default {
  'p2p-mainnet': {
    swapProgramId,
  },
  'p2p-2-mainnet': {
    swapProgramId,
  },
  'serum-mainnet': {
    swapProgramId,
  },
  'mainnet-beta': {
    swapProgramId,
  },
  devnet: {
    swapProgramId,
  },
  testnet: {
    swapProgramId,
  },
  localnet: {
    swapProgramId: null,
  },
} as PoolsByEntrypointType;
