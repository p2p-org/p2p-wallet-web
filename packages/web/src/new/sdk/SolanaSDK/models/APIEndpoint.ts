import type { Network } from '@saberhq/solana-contrib';
import { clusterApiUrl } from '@solana/web3.js';

import { RemoteConfigService } from 'new/services/RemoteConfigService';

enum APIKeysNames {
  rpcpool = 'rpcpool',
}

const API_KEYS: Record<APIKeysNames, string> = {
  rpcpool: process.env.REACT_APP_RPCPOOL_API_KEY as string,
};

export type APIEndpointProps = {
  address: string;
  network: Network;
  socketUrl?: string;
  additionalQuery?: string;
};

export class APIEndpoint {
  address: string;
  network: Network;
  socketUrl: string;
  additionalQuery?: string;

  private _apiKeyName?: APIKeysNames;

  constructor({ address, network, socketUrl, additionalQuery }: APIEndpointProps) {
    this.address = address;
    this.network = network;
    this.socketUrl = socketUrl ?? address.replace('http', 'ws');

    this._apiKeyName = additionalQuery as APIKeysNames;
    this.additionalQuery = API_KEYS[this._apiKeyName];
  }

  // TODO: defaults
  static get _defaultEndpoints(): APIEndpoint[] {
    const endpoints: APIEndpoint[] = [
      new APIEndpoint({
        address: 'https://p2p.rpcpool.com',
        network: 'mainnet-beta',
        additionalQuery: APIKeysNames.rpcpool,
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

  static get definedEndpoints(): APIEndpoint[] {
    const definedEndpoints = RemoteConfigService.definedEndpoints.map(
      ({ urlString, network, additionalQuery }) =>
        new APIEndpoint({ address: urlString, network: network as Network, additionalQuery }),
    );

    if (definedEndpoints.length) {
      return definedEndpoints;
    } else {
      return APIEndpoint._defaultEndpoints;
    }
  }

  getURL(): string {
    let url = this.address;
    const query = this.additionalQuery;
    if (query) {
      url += '/' + query;
    }
    return url;
  }

  toJSON(): APIEndpointProps {
    const { address, network, socketUrl, _apiKeyName } = this;
    return {
      address,
      network,
      socketUrl,
      additionalQuery: _apiKeyName,
    };
  }
}
