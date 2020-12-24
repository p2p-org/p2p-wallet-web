import { clusterApiUrl, Commitment, Connection, SignatureResult } from '@solana/web3.js';
import { identity, memoizeWith } from 'ramda';

import { defaultCommitment } from 'config/constants';
import { ExtendedCluster } from 'utils/types';

import { retryableProxy } from './utils/retryableProxy';

const LOCALNET_URL = 'http://localhost:8899';
// const TICK = 5000;

// The default time to wait when confirming a transaction.
export const DEFAULT_COMMITMENT: Commitment = defaultCommitment;
export let currentCluster: ExtendedCluster;

// Since connection objects include state, we memoise them here per network
const createConnection = memoizeWith<(network: string) => Connection>(identity, (network) => {
  const connection = new Connection(network, DEFAULT_COMMITMENT);

  // Due to an issue with the solana back-end relating to CORS headers on 429 responses
  // Rate-limiting responses are not retried correctly. Adding this proxy fixes this.
  const proxiedFunctions = [
    'getBalance',
    'getAccountInfo',
    'getParsedAccountInfo',
    'getParsedProgramAccounts',
    'getParsedTokenAccountsByOwner',
    'getRecentBlockhash',
    'sendTransaction',
    'sendRawTransaction',
    'requestAirdrop',
  ];
  proxiedFunctions.forEach((fnName) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    connection[fnName] = retryableProxy(connection[fnName]);
  });

  return connection;
});

export const getNetwork = (cluster: ExtendedCluster): string => {
  if (cluster === 'localnet') {
    return LOCALNET_URL;
  }

  if (cluster === 'mainnet-beta') {
    return 'https://solana-api.projectserum.com/';
  }

  return clusterApiUrl(cluster);
};

export const getConnection = (cluster?: ExtendedCluster): Connection => {
  if (cluster) {
    currentCluster = cluster;
  }

  const selectedCluster = cluster || currentCluster;

  const network = getNetwork(selectedCluster);
  return createConnection(network);
};

export const confirmTransaction = (
  signature: string,
  commitment?: Commitment,
): Promise<SignatureResult> => {
  const connection = getConnection();
  const confirmViaSocket = new Promise<SignatureResult>((resolve) =>
    connection.onSignature(signature, (signatureResult) => {
      console.log('Confirmation via socket:', signatureResult);
      resolve(signatureResult);
    }),
  );

  const confirmViaHttp = connection
    .confirmTransaction(signature, commitment || DEFAULT_COMMITMENT)
    .then((signatureResult) => {
      console.log('Confirmation via http:', signatureResult);
      return signatureResult.value;
    });

  return Promise.race([confirmViaHttp, confirmViaSocket]);
};

// type EpochCallback = (epochInfo: EpochInfo) => void;
// export const listenToEpoch = (cluster: ExtendedCluster, callback: EpochCallback): void => {
//   const connection = getConnection();
//
//   setInterval(() => {
//     connection.getEpochInfo(DEFAULT_COMMITMENT).then(callback);
//   }, TICK);
// };
