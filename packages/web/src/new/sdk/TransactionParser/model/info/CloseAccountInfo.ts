import type { Wallet } from 'new/sdk/SolanaSDK';

import type { Info } from './Info';

// A struct that contains all information about closing account.
export class CloseAccountInfo implements Info {
  // The SOL amount of the account that will be returned.
  reimbursedAmount?: number | null;
  // The closed wallet
  closedWallet?: Wallet | null;

  constructor({
    reimbursedAmount,
    closedWallet,
  }: {
    reimbursedAmount?: number | null;
    closedWallet?: Wallet | null;
  }) {
    this.reimbursedAmount = reimbursedAmount;
    this.closedWallet = closedWallet;
  }

  // extension

  get amount(): number {
    return this.reimbursedAmount ?? 0;
  }

  get symbol(): string {
    return 'SOL';
  }
}
