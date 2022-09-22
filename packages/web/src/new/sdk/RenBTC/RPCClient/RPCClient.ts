import type { LockAndMintIncomingTransaction } from 'new/sdk/RenBTC/Actions/LockAndMint/LockAndMint.IncomingTransaction';
import type { Network } from 'new/sdk/RenBTC/Models/Network';

export interface RenVMRpcClientType {
  network: Network;
  call: <T, S extends {}>(endpoint: string, method: string, params: S) => Promise<T>;
  selectPublicKey: (mintTokenSymbol: string) => Promise<Uint8Array>;
  getIncomingTransactions: (address: string) => Promise<LockAndMintIncomingTransaction[]>;
}
