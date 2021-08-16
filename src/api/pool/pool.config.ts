import { PublicKey } from '@solana/web3.js';

import { ExtendedCluster } from 'utils/types';

export type PoolConfig = {
  swapProgramId: PublicKey | null;
};

const swapProgramId = new PublicKey('DjVE6JNiYqPL2QXyCUUh8rNjHrbz9hXHNYt99MQ59qw1');

const poolsByEntrypointType: {
  [cluster in ExtendedCluster]: PoolConfig;
} = {
  'mainnet-beta': {
    swapProgramId,
  },
  devnet: {
    swapProgramId,
  },
  testnet: {
    swapProgramId,
  },
  // localnet: {
  //   swapProgramId: null,
  // },
};

// eslint-disable-next-line import/no-default-export
export default poolsByEntrypointType;
