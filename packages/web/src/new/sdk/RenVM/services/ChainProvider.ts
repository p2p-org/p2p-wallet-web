import type { RenVMChainType } from '../chains/RenVMChainType';

export interface ChainProvider {
  getAccount(): Promise<Uint8Array>;
  load(): Promise<RenVMChainType>;
}
