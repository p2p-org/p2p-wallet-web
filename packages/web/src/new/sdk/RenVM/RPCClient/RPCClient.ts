import type { JSONRPCResponse } from '@renproject/provider';
import type { RenVMParams, RenVMResponses } from '@renproject/rpc/build/module/v2';
import { mintParamsType, RPCMethod } from '@renproject/rpc/build/module/v2';
import { SECONDS } from '@renproject/utils/build/main';
import { fromBase64 } from '@renproject/utils/internal/common';
import { u64 } from '@solana/spl-token';
import { plainToInstance } from 'class-transformer';
import type { CancellablePromise } from 'real-cancellable-promise';
import { buildCancellablePromise } from 'real-cancellable-promise';

import { LogEvent, Logger } from 'new/sdk/SolanaSDK';
import { cancellableAxios } from 'new/utils/promise/PromiseExtensions';

import { IncomingTransaction } from '../actions/LockAndMint';
import type { MintTransactionInput, Network, Selector } from '../models';
import {
  RenVMError,
  ResponseQueryBlockState,
  ResponseQueryConfig,
  ResponseQueryTxMint,
  ResponseSubmitTxMint,
} from '../models';

const makeBody = (method: string, params?: unknown) => ({
  id: 1,
  jsonrpc: '2.0',
  method,
  params,
});

export interface RenVMRpcClientType {
  readonly network: Network;
  call<Method extends keyof RenVMParams>({
    endpoint,
    method,
    params,
    log,
  }: {
    endpoint: string;
    method: Method;
    params: RenVMParams[Method];
    log: boolean;
    retry?: number; // @renjs
    timeout?: number; // @renjs
  }): CancellablePromise<RenVMResponses[Method]>;
  selectPublicKey(mintTokenSymbol: string): Promise<Uint8Array | null>;
  getIncomingTransactions(address: string): Promise<IncomingTransaction[]>;

  // extension

  queryMint(txHash: string): CancellablePromise<ResponseQueryTxMint>;

  queryBlockState(log: boolean): CancellablePromise<ResponseQueryBlockState>;

  queryConfig(): Promise<ResponseQueryConfig>;

  submitTx({
    hash,
    selector,
    version,
    input,
  }: {
    hash: string;
    selector: Selector;
    version: string;
    input: MintTransactionInput;
  }): CancellablePromise<ResponseSubmitTxMint>;

  getTransactionFee(mintTokenSymbol: string): Promise<u64>;
}

export class RpcClient implements RenVMRpcClientType {
  readonly network: Network;

  constructor({ network }: { network: Network }) {
    this.network = network;
  }

  call<Method extends keyof RenVMParams>({
    endpoint,
    method,
    params,
    log,
    timeout = 120 * SECONDS,
  }: {
    endpoint: string;
    method: Method;
    params: RenVMParams[Method];
    log: boolean;
    retry?: number; // @renjs
    timeout?: number; // @renjs
  }): CancellablePromise<RenVMResponses[Method]> {
    return buildCancellablePromise(async (capture) => {
      try {
        new URL(endpoint);
      } catch {
        throw RenVMError.invalidEndpoint();
      }

      // Log
      if (log) {
        Logger.log(
          `renBTC event ${method} ${JSON.stringify(params, null, '    ')}`,
          LogEvent.request,
        );
      }

      // prepare urlRequest
      const body = makeBody(method, params);

      const response = await capture(
        cancellableAxios<JSONRPCResponse<RenVMResponses[Method]>>({
          method: 'post',
          url: endpoint,
          data: body,
          // Use a 120 second timeout. This could be reduced, but
          // should be done based on the method, since some requests
          // may take a long time, especially on a slow connection.
          timeout,
        }),
      );

      const statusCode = response.status ?? 0;
      const isValidStatus = 200 <= statusCode && statusCode <= 300;

      if (log) {
        Logger.log(JSON.stringify(response.data.result, null, '    '), LogEvent.response);
      }

      const result = response.data.result;
      if (isValidStatus && result) {
        return result;
      }

      throw response.data.error ?? RenVMError.unknown();
    });
  }

  async getIncomingTransactions(address: string): Promise<IncomingTransaction[]> {
    const urlString = `https://blockstream.info${
      this.network.isTestnet ? '/testnet' : ''
    }/api/address/${address}/utxo`;
    try {
      new URL(urlString);
    } catch {
      throw RenVMError.invalidEndpoint();
    }
    Logger.log(urlString, LogEvent.request);
    const data: IncomingTransaction[] = await (await fetch(urlString)).json();
    Logger.log(JSON.stringify(data, null, '    '), LogEvent.response);

    return plainToInstance(IncomingTransaction, data);
  }

  // extension

  private _emptyParams: Record<string, string> = {};

  queryMint(txHash: string): CancellablePromise<ResponseQueryTxMint> {
    return buildCancellablePromise(async (capture) => {
      const result = await capture(
        this.call({
          endpoint: this.network.lightNode,
          method: RPCMethod.QueryTx,
          params: { txHash: txHash },
          log: true,
        }),
      );
      return plainToInstance(ResponseQueryTxMint, result);
    });
  }

  queryBlockState(log = false): CancellablePromise<ResponseQueryBlockState> {
    return buildCancellablePromise(async (capture) => {
      const result = await capture(
        this.call({
          endpoint: this.network.lightNode,
          method: RPCMethod.QueryBlockState,
          params: this._emptyParams,
          log,
        }),
      );
      return plainToInstance(ResponseQueryBlockState, result);
    });
  }

  async queryConfig(): Promise<ResponseQueryConfig> {
    const result = await this.call({
      endpoint: this.network.lightNode,
      method: RPCMethod.QueryConfig,
      params: this._emptyParams,
      log: true,
    });
    return plainToInstance(ResponseQueryConfig, result);
  }

  submitTx({
    hash,
    selector,
    version,
    input,
  }: {
    hash: string;
    selector: Selector;
    version: string;
    input: MintTransactionInput;
  }): CancellablePromise<ResponseSubmitTxMint> {
    return buildCancellablePromise(async (capture) => {
      const result = await capture(
        this.call({
          endpoint: this.network.lightNode,
          method: RPCMethod.SubmitTx,
          params: {
            tx: {
              hash,
              selector: selector.toString(),
              version,
              in: {
                t: mintParamsType(),
                v: input,
              },
            },
          },
          log: true,
        }),
      );
      return plainToInstance(ResponseSubmitTxMint, result);
    });
  }

  async selectPublicKey(mintTokenSymbol: string): Promise<Uint8Array | null> {
    const blockState = await this.queryBlockState();
    return fromBase64(blockState.publicKey(mintTokenSymbol) ?? '');
  }

  async getTransactionFee(mintTokenSymbol: string): Promise<u64> {
    // @ios: TODO: - Remove later: Support other tokens
    if (mintTokenSymbol !== 'BTC') {
      throw RenVMError.other('Unsupported token');
    }

    const blockState = await this.queryBlockState(true);

    const gasLimit = new u64(blockState.state.v.btc.gasLimit);
    const gasCap = new u64(blockState.state.v.btc.gasCap);

    if (!gasLimit || !gasCap) {
      throw RenVMError.other('Could not calculate transaction fee');
    }
    return new u64(gasLimit.mul(gasCap));
  }
}
