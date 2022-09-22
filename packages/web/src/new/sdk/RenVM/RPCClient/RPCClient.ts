import type { LockAndMintIncomingTransaction } from '../actions/LockAndMint';
import type { Network } from '../models';

export interface RenVMRpcClientType {
  network: Network;
  call: <T, S extends {}>(endpoint: string, method: string, params: S) => Promise<T>;
  selectPublicKey: (mintTokenSymbol: string) => Promise<Uint8Array>;
  getIncomingTransactions: (address: string) => Promise<LockAndMintIncomingTransaction[]>;
}
