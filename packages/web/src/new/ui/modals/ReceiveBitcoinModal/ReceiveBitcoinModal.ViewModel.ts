import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';
import { singleton } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { convertToBalance } from 'new/sdk/SolanaSDK';
import { PricesService } from 'new/services/PriceAPIs/PricesService';
import { WalletsRepository } from 'new/services/Repositories';
import { ChooseWalletViewModel } from 'new/ui/components/common/ChooseWallet';
import { numberToString } from 'new/utils/NumberExtensions';

import { RenBTCStatusService } from './RenBTCStatusService';

export enum RenBTCAccountStatus {
  topUpRequired = 'topUpRequired',
  payingWalletAvailable = 'payingWalletAvailable',
}

interface ReceiveBitcoinModalViewModelType {
  readonly solanaPubkey: string | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly accountStatus: RenBTCAccountStatus | null;
  readonly payingWallet: Wallet | null;
  readonly totalFee: number | null;
  readonly feeInFiat: number | null;

  reload(): void;
  createRenBTC(): void;
}

@singleton()
export class ReceiveBitcoinModalViewModel
  extends ViewModel
  implements ReceiveBitcoinModalViewModelType
{
  isLoading = true;
  error: string | null = null;
  accountStatus: RenBTCAccountStatus | null = null;
  payableWallets: Wallet[] = [];

  payingWallet: Wallet | null = null;
  totalFee: number | null = null;
  feeInFiat: number | null = null;

  constructor(
    private _renBTCStatusService: RenBTCStatusService,
    private _priceService: PricesService,
    private _walletsRepository: WalletsRepository,
    public choosePayingWalletViewModel: ChooseWalletViewModel,
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
      feeInText: computed,

      reload: action,
      walletDidSelect: action,
      createRenBTC: action,
    });
  }

  protected override setDefaults(): void {
    this.isLoading = false;
    this.accountStatus = null;
    this.payableWallets = [];
    this.payingWallet = null;

    this.totalFee = null;
    this.feeInFiat = null;
  }

  protected override onInitialize(): void {
    this.choosePayingWalletViewModel.initialize();

    void this.reload();
    void this._bind();
  }

  protected override afterReactionsRemoved(): void {
    this.choosePayingWalletViewModel.end();
  }

  get solanaPubkey(): string | null {
    return this._walletsRepository.nativeWallet?.pubkey ?? null;
  }

  get feeInText(): string | null {
    const fee = this.totalFee;
    const wallet = this.payingWallet;
    if (!fee || !wallet) {
      return null;
    }
    return `${numberToString(fee, { maximumFractionDigits: 9 })} ${wallet.token.symbol}`;
  }

  // Methods

  async reload(): Promise<void> {
    this.isLoading = true;
    this.error = null;
    this.accountStatus = null;
    this.payableWallets = [];
    this.payingWallet = null;

    try {
      await this._renBTCStatusService.load();
      const payableWallets = await this._renBTCStatusService.getPayableWallets();

      runInAction(() => {
        this.error = null;
        this.accountStatus = payableWallets.length
          ? RenBTCAccountStatus.payingWalletAvailable
          : RenBTCAccountStatus.topUpRequired;
        this.payableWallets = payableWallets;
        this.payingWallet = payableWallets[0] ?? null;
      });
    } catch (error) {
      runInAction(() => {
        console.error(error);
        this.error = (error as Error).message;
        this.accountStatus = null;
        this.payableWallets = [];
        this.payingWallet = null;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  private _bind(): void {
    this.addReaction(
      reaction(
        () => this.payingWallet,
        async (wallet) => {
          if (!wallet) {
            this.totalFee = null;
            return;
          }
          try {
            const fee = await this._renBTCStatusService.getCreationFee(wallet.mintAddress);
            runInAction(() => {
              this.totalFee = convertToBalance(fee, wallet.token.decimals);
            });
          } catch {
            runInAction(() => {
              this.totalFee = null;
            });
          }
        },
      ),
    );

    this.addReaction(
      reaction(
        () => this.totalFee,
        (fee) => {
          const symbol = this.payingWallet?.token.symbol;
          if (!fee || !symbol) {
            this.feeInFiat = null;
            return;
          }
          const price = this._priceService.currentPrice(symbol)?.value;
          if (!price) {
            this.feeInFiat = null;
            return;
          }
          this.feeInFiat = fee * price;
        },
      ),
    );
  }

  walletDidSelect(wallet: Wallet): void {
    this.payingWallet = wallet;
  }

  async createRenBTC(): Promise<void> {
    const mintAddress = this.payingWallet?.mintAddress;
    const address = this.payingWallet?.pubkey;
    if (!mintAddress || !address) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      await this._renBTCStatusService.createAccount(address, mintAddress);
      this.error = null;
    } catch (error) {
      console.error(error);
      this.error = (error as Error).message;
    } finally {
      this.isLoading = false;
    }
  }
}
