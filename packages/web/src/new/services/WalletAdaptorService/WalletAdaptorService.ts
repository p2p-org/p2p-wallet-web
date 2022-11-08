import '@abraham/reflection';

import type { Adapter, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { singleton } from 'tsyringe';

import { MnemonicAdapter } from 'new/scenes/Main/Auth/MnemonicAdapter';

export interface IWalletAdaptorService {
  getAdaptors(network: WalletAdapterNetwork): Array<Adapter>;
}

@singleton()
export class WalletAdaptorService implements IWalletAdaptorService {
  constructor() {}

  getAdaptors(network: WalletAdapterNetwork): Array<Adapter | MnemonicAdapter> {
    return [
      new MnemonicAdapter(),
      new PhantomWalletAdapter(),
      new SolletWalletAdapter({ network }),
      new SolletExtensionWalletAdapter({ network }),
    ];
  }
}
