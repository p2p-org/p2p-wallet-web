import type { u64 } from '@solana/spl-token';

import type { IncomingTransaction } from '../actions/LockAndMint';
import type {
  MintTransactionInput,
  Network,
  ResponseQueryBlockState,
  ResponseQueryConfig,
  ResponseQueryTxMint,
  ResponseSubmitTxMint,
  Selector,
} from '../models';

export interface RenVMRpcClientType {
  readonly network: Network;
  call: <T, S extends {}>({
    endpoint,
    method,
    params,
    log,
  }: {
    endpoint: string;
    method: string;
    params: S;
    log: boolean;
  }) => Promise<T>;
  selectPublicKey: (mintTokenSymbol: string) => Promise<Uint8Array | null>;
  getIncomingTransactions: (address: string) => Promise<IncomingTransaction[]>;

  // extension

  queryMint(txHash: string): Promise<ResponseQueryTxMint>;

  queryBlockState(log: boolean): Promise<ResponseQueryBlockState>;

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
  }): Promise<ResponseSubmitTxMint>;

  getTransactionFee(mintTokenSymbol: string): Promise<u64>;
}
