import type { Network } from '@saberhq/solana-contrib';
import { clusterApiUrl } from '@solana/web3.js';

export class APIEndpoint {
  address: string;
  network: Network;
  socketUrl: string;
  additionalQuery?: string;

  constructor({
    address,
    network,
    socketUrl,
    additionalQuery,
  }: {
    address: string;
    network: Network;
    socketUrl?: string;
    additionalQuery?: string;
  }) {
    this.address = address;
    this.network = network;
    this.socketUrl = socketUrl ?? address.replace('http', 'ws');
    this.additionalQuery = additionalQuery;
  }

  // TODO: defaults
  static get defaultEndpoints(): APIEndpoint[] {
    const endpoints: APIEndpoint[] = [
      new APIEndpoint({
        address: 'https://p2p.rpcpool.com',
        network: 'mainnet-beta',
        additionalQuery: process.env.REACT_APP_RPCPOOL_API_KEY,
      }),
      new APIEndpoint({
        address: 'https://solana-api.projectserum.com',
        network: 'mainnet-beta',
      }),
      new APIEndpoint({
        address: clusterApiUrl('mainnet-beta'),
        network: 'mainnet-beta',
      }),
    ];

    // TODO: add feature flag condition
    // if (debug) {
    // endpoints.push(
    //   new APIEndpoint({
    //     address: clusterApiUrl('testnet'),
    //     network: 'testnet',
    //   }),
    // );
    // endpoints.push(
    //   new APIEndpoint({
    //     address: clusterApiUrl('devnet'),
    //     network: 'devnet',
    //   }),
    // );
    // }

    return endpoints;
  }

  getURL(): string {
    let url = this.address;
    const query = this.additionalQuery;
    if (query) {
      url += '/' + query;
    }
    return url;
  }

  getSocketURL(): string {
    let url = this.socketUrl;
    const query = this.additionalQuery;
    if (query) {
      url += '/' + query;
    }
    return url;
  }
}
