import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { Wallet } from 'new/sdk/SolanaSDK';

enum RenBTCAccountStatus {
  topUpRequired,
  payingWalletAvailable,
}

@singleton()
export class ReceiveBitcoinModalViewModel extends ViewModel {
  isLoading = true;
  errorSubject: string | null = null;
  accountStatusSubject: RenBTCAccountStatus | null = null;
  payableWalletsSubject: Wallet[] = [];
  payingWalletSubject: Wallet | null = null;
  totalFeeSubject = 0;
  feeInFiatSubject = 0;

  constructor() {
    super();
  }

  protected override setDefaults() {
    this.isLoading = true;
    this.errorSubject = null;
    this.accountStatusSubject = null;
    this.payableWalletsSubject = [];
    this.payingWalletSubject = null;
  }

  protected override onInitialize() {
    // this.reload();
    // this.bind();
  }

  protected override afterReactionsRemoved() {}

  /*async reload(): void {
    await
  }*/
}
