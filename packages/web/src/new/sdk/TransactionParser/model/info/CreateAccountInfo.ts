import type { Wallet } from 'new/sdk/SolanaSDK';

import type { Info } from './Info';

// A struct that contains all information about creating account.
export class CreateAccountInfo implements Info {
  // The amount of fee in SOL.
  fee?: number | null;
  // The created wallet.
  newWallet?: Wallet | null;

  constructor({ fee, newWallet }: { fee?: number | null; newWallet?: Wallet | null }) {
    this.fee = fee;
    this.newWallet = newWallet;
  }

  static empty() {
    return new CreateAccountInfo({ fee: null, newWallet: null });
  }

  // extension

  get amount(): number {
    return -(this.fee ?? 0);
  }

  get symbol(): string {
    return 'SOL';
  }
}
