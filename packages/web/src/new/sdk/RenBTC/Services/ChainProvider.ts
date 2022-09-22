import type { RenVMChainType } from 'new/sdk/RenBTC/Chains/RenVMChainType';

export interface ChainProvider {
  getAccount: () => Promise<{ publicKey: Uint8Array; secret: Uint8Array }>;
  load: () => Promise<RenVMChainType>;
}
