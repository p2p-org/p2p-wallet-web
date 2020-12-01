import * as web3 from '@solana/web3.js';

export const POOLS_BY_ENTRYPOINT = {
  [web3.clusterApiUrl('mainnet-beta')]: {
    swapProgramId: new web3.PublicKey('9qvG1zUp8xF1Bi4m6UdRNby1BAAuaDrUxSpv4CmRRMjL'),
  },
  [web3.clusterApiUrl('testnet')]: {
    swapProgramId: new web3.PublicKey('2n2dsFSgmPcZ8jkmBZLGUM2nzuFqcBGQ3JEEj6RJJcEg'),
  },
  [web3.clusterApiUrl('devnet')]: {
    swapProgramId: new web3.PublicKey('BSfTAcBdqmvX5iE2PW88WFNNp2DHhLUaBKk5WrnxVkcJ'),
  },
};
