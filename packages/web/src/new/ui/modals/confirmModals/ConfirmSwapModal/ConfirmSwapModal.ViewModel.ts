import { action, computed, makeObservable } from 'mobx';
import assert from 'ts-invariant';
import { injectable } from 'tsyringe';

import type { LoadableRelay } from 'new/app/models/LoadableRelay';
import type { PayingFee } from 'new/app/models/PayingFee';
import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { SwapViewModel } from 'new/scenes/Main/Swap';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';
import { PricesService } from 'new/services/PriceAPIs/PricesService';
import { numberToString } from 'new/utils/NumberExtensions';

// @web: i use injectable to don't reset swapViewModel during hmr, it cause
// page crash then swapViewModel is not available
@injectable()
export class ConfirmSwapModalViewModel extends ViewModel {
  private _swapViewModel: Readonly<SwapViewModel> | null;

  constructor(private _pricesService: PricesService) {
    super();

    this._swapViewModel = null;

    makeObservable(this, {
      sourceWallet: computed,
      destinationWallet: computed,
      inputAmount: computed,
      estimatedAmount: computed,
      minimumReceiveAmount: computed,
      exchangeRate: computed,
      fees: computed,
      slippage: computed,

      getPrice: action,
      authenticateAndSwap: action,

      inputAmountString: computed,
      inputAmountInFiatString: computed,
      estimatedAmountString: computed,
      receiveAtLeastString: computed,
      receiveAtLeastInFiatString: computed,

      totalFees: computed,
      setSwapViewModel: action,
    });
  }

  protected override setDefaults() {
    // this._swapViewModel = null;
  }

  protected override onInitialize() {}

  protected override afterReactionsRemoved() {}

  get sourceWallet(): Wallet | null {
    assert(this._swapViewModel, 'SwapViewModel is not set');
    return this._swapViewModel.sourceWallet;
  }

  get destinationWallet(): Wallet | null {
    assert(this._swapViewModel, 'SwapViewModel is not set');
    return this._swapViewModel.destinationWallet;
  }

  get inputAmount(): number | null {
    assert(this._swapViewModel, 'SwapViewModel is not set');
    return this._swapViewModel.inputAmount;
  }

  get estimatedAmount(): number | null {
    assert(this._swapViewModel, 'SwapViewModel is not set');
    return this._swapViewModel.estimatedAmount;
  }

  get minimumReceiveAmount(): number | null {
    assert(this._swapViewModel, 'SwapViewModel is not set');
    return this._swapViewModel.minimumReceiveAmount;
  }

  get exchangeRate(): number | null {
    assert(this._swapViewModel, 'SwapViewModel is not set');
    return this._swapViewModel.exchangeRate;
  }

  get fees(): LoadableRelay<PayingFee[]> {
    assert(this._swapViewModel, 'SwapViewModel is not set');
    return this._swapViewModel.fees;
  }

  get slippage(): number {
    assert(this._swapViewModel, 'SwapViewModel is not set');
    return this._swapViewModel.slippage;
  }

  getPrice(symbol: string): number | null {
    return this._pricesService.currentPrice(symbol)?.value ?? null;
  }

  authenticateAndSwap(): void {
    assert(this._swapViewModel, 'SwapViewModel is not set');
    this._swapViewModel.authenticateAndSwap();
  }

  // Extend

  get inputAmountString(): string {
    const wallet = this.sourceWallet;
    const amount = this.inputAmount;
    return `${numberToString(amount ?? 0, {
      maximumFractionDigits: 9,
    })} ${wallet?.token.symbol}`;
  }

  get inputAmountInFiatString(): string {
    const wallet = this.sourceWallet;
    const amount = this.inputAmount;
    return `${Defaults.fiat.symbol}${numberToString(
      (amount ?? 0) * (wallet?.priceInCurrentFiat ?? 0),
      {
        maximumFractionDigits: 2,
      },
    )}`;
  }

  get estimatedAmountString(): string {
    const wallet = this.destinationWallet;
    const amount = this.estimatedAmount;
    return `${numberToString(amount ?? 0, { maximumFractionDigits: 9 })} ${wallet?.token.symbol}`;
  }

  get receiveAtLeastString(): string {
    const wallet = this.destinationWallet;
    const amount = this.minimumReceiveAmount;
    return `${numberToString(amount ?? 0, { maximumFractionDigits: 9 })} ${
      wallet?.token.symbol ?? ''
    }`;
  }

  get receiveAtLeastInFiatString(): string {
    const wallet = this.destinationWallet;
    const amount = this.minimumReceiveAmount;
    return `${Defaults.fiat.symbol}${numberToString(
      (amount ?? 0) * (wallet?.priceInCurrentFiat ?? 0),
      { maximumFractionDigits: 2 },
    )}`;
  }

  // @web: own code

  get totalFees(): {
    totalFeesSymbol: string;
    decimals: number;
    amount: number;
    amountInFiat: number;
  } | null {
    assert(this._swapViewModel, 'SwapViewModel is not set');
    return this._swapViewModel.totalFees;
  }

  setSwapViewModel(swapViewModel: Readonly<SwapViewModel>): void {
    this._swapViewModel = swapViewModel;
  }
}
