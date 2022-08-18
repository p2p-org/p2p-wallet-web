import '@abraham/reflection';

import type { Adapter, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { singleton } from 'tsyringe';

export interface IWalletAdaptorService {
  getAdaptors(network: WalletAdapterNetwork): Array<Adapter>;
}

@singleton()
export class WalletAdaptorService implements IWalletAdaptorService {
  constructor() {}
  getAdaptors(network: WalletAdapterNetwork): Array<Adapter> {
    return [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new SolletWalletAdapter({ network }),
      new SolletExtensionWalletAdapter({ network }),
    ];
  }
}