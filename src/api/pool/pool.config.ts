import { PublicKey } from '@solana/web3.js';

export type PoolConfig = {
  swapProgramId: PublicKey | null;
};

type PoolsByEntrypointType = {
  [cluster: string]: PoolConfig;
};

// eslint-disable-next-line import/no-default-export
export default {
  localnet: {
    swapProgramId: null,
  },
  devnet: {
    swapProgramId: new PublicKey('SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8'),
  },
  testnet: {
    swapProgramId: new PublicKey('SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8'),
  },
  'mainnet-beta': {
    swapProgramId: new PublicKey('SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8'),
  },
  p2p: {
    swapProgramId: new PublicKey('SwaPpA9LAaLfeLi3a68M4DjnLqgtticKg6CnyNwgAC8'),
  },
} as PoolsByEntrypointType;
