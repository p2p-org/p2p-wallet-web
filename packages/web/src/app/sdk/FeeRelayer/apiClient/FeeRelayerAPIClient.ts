import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';

import { FeeRelayer } from '../FeeRelayer';
import type { FeeRelayerRequestType } from '../models/FeeRelayerRequestType';
import * as Relay from '../relay/helpers/FeeRelayerRelayModels';

const request = axios.create();

export type FeeRelayerAPIClientType = {
  version: number;
  getFeePayerPubkey(): Promise<string>;
  requestFreeFeeLimits(authority: string): Promise<Relay.FeeLimitForAuthorityResponse>;
  sendTransaction(requestType: FeeRelayerRequestType): Promise<string>;
};

export class FeeRelayerAPIClient implements FeeRelayerAPIClientType {
  // Properties
  version: number;

  // Initializers
  constructor(version: number) {
    this.version = version;
  }

  // Methods

  /// Get fee payer for free transaction
  /// - Returns: Account's public key that is responsible for paying fee
  async getFeePayerPubkey(): Promise<string> {
    let url = FeeRelayer.feeRelayerUrl;
    if (this.version > 1) {
      url += `/v${this.version}`;
    }
    url += '/fee_payer/pubkey';

    return request.get(url).then(({ data }) => data);
  }

  requestFreeFeeLimits(authority: string): Promise<Relay.FeeLimitForAuthorityResponse> {
    let url = FeeRelayer.feeRelayerUrl;
    if (this.version > 1) {
      url += `/v${this.version}`;
    }
    url += `/free_fee_limits/${authority}`;

    return request
      .get<Relay.FeeLimitForAuthorityResponseType>(url)
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
      return data.replace('[', '').replace(']', '');
    });
  }

  private _urlRequest(requestType: FeeRelayerRequestType): AxiosRequestConfig {
    let url = FeeRelayer.feeRelayerUrl;
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
