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
    swapProgramId: new PublicKey('E7G3NKPwVcuPXjqL11J2ZZWBVRsocb6Lu3nK5BrRwBNd'),
  },
  testnet: {
    swapProgramId: new PublicKey('FmgrCQX1JJSAkJEk8fiL85Cgnh7g3DS1rmakEjP1eCyL'),
  },
  'mainnet-beta': {
    swapProgramId: new PublicKey('9qvG1zUp8xF1Bi4m6UdRNby1BAAuaDrUxSpv4CmRRMjL'),
  },
} as PoolsByEntrypointType;
