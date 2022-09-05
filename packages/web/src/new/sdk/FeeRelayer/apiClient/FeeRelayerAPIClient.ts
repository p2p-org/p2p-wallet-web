import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';

import type { FeeRelayerRequestType } from '../models/FeeRelayerRequestType';
import * as Relay from '../relay/helpers/FeeRelayerRelayModels';

const request = axios.create();

export interface FeeRelayerAPIClientType {
  version: number;
  getFeePayerPubkey(): Promise<string>;
  requestFreeFeeLimits(authority: string): Promise<Relay.FeeLimitForAuthorityResponse>;
  sendTransaction(requestType: FeeRelayerRequestType): Promise<string>;
}

// TODO: APIClientError

export class FeeRelayerAPIClient implements FeeRelayerAPIClientType {
  // Properties
  version: number;
  private _baseUrlString: string;

  // Initializers
  constructor(version = 1) {
    this.version = version;
    this._baseUrlString = 'https://solana-fee-relayer.wallet.p2p.org'; // TODO: from params
  }

  // Methods

  /// Get fee payer for free transaction
  /// - Returns: Account's public key that is responsible for paying fee
  async getFeePayerPubkey(): Promise<string> {
    let url = this._baseUrlString;
    if (this.version > 1) {
      url += `/v${this.version}`;
    }
    url += '/fee_payer/pubkey';

    return request(url).then(({ data }) => data);
  }

  requestFreeFeeLimits(authority: string): Promise<Relay.FeeLimitForAuthorityResponse> {
    let url = this._baseUrlString;
    if (this.version > 1) {
      url += `/v${this.version}`;
    }
    url += `/free_fee_limits/${authority}`;

    return request
      .get<Relay.FeeLimitForAuthorityResponseJSON>(url)
      .then(({ data }) => Relay.FeeLimitForAuthorityResponse.fromJSON(data));
  }

  /// Send transaction to fee relayer
  /// - Parameters:
  ///   - path: additional path for request
  ///   - params: request's parameters
  /// - Returns: transaction id
  sendTransaction(requestType: FeeRelayerRequestType): Promise<string> {
    // TODO: add error parsing
    return request(this._urlRequest(requestType)).then(({ data }) => {
      return data[0];
    });
  }

  private _urlRequest(requestType: FeeRelayerRequestType): AxiosRequestConfig {
    let url = this._baseUrlString;
    if (this.version > 1) {
      url += `/v${this.version}`;
    }
    url += requestType.path;

    return <AxiosRequestConfig>{
      url,
      method: 'post',
      responseType: 'json',
      data: requestType.getParams(),
    };
  }
}
