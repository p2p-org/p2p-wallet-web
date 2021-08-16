import { Commitment, Connection, SignatureResult } from '@solana/web3.js';
import { memoizeWith, toString } from 'ramda';

import { defaultCommitment, NetworkType } from 'config/constants';

import { retryableProxy } from './utils/retryableProxy';

// The default time to wait when confirming a transaction.
export const DEFAULT_COMMITMENT: Commitment = defaultCommitment;

let currentNetwork: NetworkType;
let currentNetworkTransactions: NetworkType;

// Since connection objects include state, we memoise them here per network
const createConnection = memoizeWith(
  toString,
  (network: NetworkType): Connection => {
    const connection = new Connection(network.endpoint, {
      wsEndpoint: network.wsEndpoint,
      httpHeaders: network.httpHeaders,
      commitment: DEFAULT_COMMITMENT,
    });

    // Due to an issue with the solana back-end relating to CORS headers on 429 responses
    // Rate-limiting responses are not retried correctly. Adding this proxy fixes this.
    const proxiedFunctions = [
      'getBalance',
      // 'getAccountInfo',
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
  },
);

export const getEndpoint = (network: NetworkType): string => {
  return network.endpoint;
};
export const getWsEndpoint = (network: NetworkType): string | undefined => {
  return network.wsEndpoint;
};

export const getConnection = (network?: NetworkType): Connection => {
  if (network) {
    currentNetwork = network;
  }

  return createConnection(currentNetwork);
};

export const getConnectionTransactions = (network?: NetworkType): Connection => {
  if (network) {
    currentNetworkTransactions = { ...network };

    // HACK: take transactions history from the official node
    if (network.cluster === 'mainnet-beta') {
      currentNetworkTransactions.endpoint = 'https://api.mainnet-beta.solana.com';
    }
  }

  return createConnection(currentNetworkTransactions);
};

export const confirmTransaction = (
  signature: string,
  commitment: Commitment = DEFAULT_COMMITMENT,
): Promise<SignatureResult> => {
  const connection = getConnection();
  const confirmViaSocket = new Promise<SignatureResult>((resolve) =>
    connection.onSignature(signature, (signatureResult) => {
      console.log('Confirmation via socket:', signatureResult);
      resolve(signatureResult);
    }),
  );

  const confirmViaHttp = connection
    .confirmTransaction(signature, commitment)
    .then((signatureResult) => {
      console.log('Confirmation via http:', signatureResult);
      return signatureResult.value;
    });

  return Promise.race([confirmViaHttp, confirmViaSocket]);
};
