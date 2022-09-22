import type { RenVMChainType } from '../chains/RenVMChainType';

export interface ChainProvider {
  getAccount: () => Promise<{ publicKey: Uint8Array; secret: Uint8Array }>;
  load: () => Promise<RenVMChainType>;
}
