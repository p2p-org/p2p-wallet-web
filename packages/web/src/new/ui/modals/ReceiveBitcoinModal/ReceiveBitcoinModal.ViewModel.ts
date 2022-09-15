import { ZERO } from '@orca-so/sdk';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { NotificationService } from 'new/services/NotificationService';
import { PricesService } from 'new/services/PriceAPIs/PricesService';
import { WalletsRepository } from 'new/services/Repositories';
import { RenBTCStatusService } from 'new/ui/modals/ReceiveBitcoinModal/RenBTCStatusService';

export enum RenBTCAccountStatus {
  topUpRequired,
  payingWalletAvailable,
}

@singleton()
export class ReceiveBitcoinModalViewModel extends ViewModel {
  isLoading = true;
  error: string | null = null;
  accountStatus: RenBTCAccountStatus | null = null;
  payableWallets: Wallet[] = [];
  payingWallet: Wallet | null = null;
  totalFee = ZERO;
  feeInFiat = 0;

  constructor(
    private _renBTCStatusService: RenBTCStatusService,
    private _priceService: PricesService,
    private _walletsRepository: WalletsRepository,
    private _notificationService: NotificationService,
  ) {
    super();

    makeObservable(this, {
      isLoading: observable,
      error: observable,
      accountStatus: observable,
      payableWallets: observable,
      payingWallet: observable,
      totalFee: observable,
      feeInFiat: observable,

      solanaPubkey: computed,
    });
  }

  protected override setDefaults() {
    this.isLoading = false;
    this.accountStatus = null;
    this.payableWallets = [];
    this.payingWallet = null;
    this.totalFee = ZERO;
    this.feeInFiat = 0;
  }

  protected override onInitialize() {
    void this.reload();
  }

  protected override afterReactionsRemoved() {}

  get solanaPubkey(): string | null {
    return this._walletsRepository.nativeWallet?.pubkey ?? null;
  }

  async reload(): Promise<void> {
    await this._renBTCStatusService.load();

    const payableWallets = await this._renBTCStatusService.getPayableWallets();

    const payingWallet = payableWallets.length ? payableWallets[0]! : null;

    const totalFee = payingWallet
      ? await this._renBTCStatusService.getCreationFee(payingWallet.mintAddress)
      : ZERO;

    const currentPrice = payingWallet
      ? this._priceService.currentPrice(payingWallet.token.symbol)?.value || 0
      : 0;
    const feeInFiat = totalFee.toNumber() * currentPrice;

    runInAction(() => {
      this.isLoading = false;
      this.accountStatus = payableWallets.length
        ? RenBTCAccountStatus.payingWalletAvailable
        : RenBTCAccountStatus.topUpRequired;
      this.payableWallets = payableWallets;
      this.payingWallet = payingWallet;
      this.totalFee = totalFee;
      this.feeInFiat = feeInFiat;
    });
  }

  async createRenBTC() {
    const mintAddress = this.payingWallet?.mintAddress;
    const address = this.payingWallet?.pubkey;

    if (!mintAddress || !address) {
      return;
    }

    runInAction(() => {
      this.isLoading = true;
    });

    try {
      await this._renBTCStatusService.createAccount(address, mintAddress);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  errorNotification(message: string): void {
    this._notificationService.error(message);
  }
}
