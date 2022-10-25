import { action, computed, makeObservable, observable, reaction } from 'mobx';
import { delay, inject, injectable } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { Network, SendViewModel } from 'new/scenes/Main/Send';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { LogEvent, Logger } from 'new/sdk/SolanaSDK';
import { ChooseWalletViewModel } from 'new/ui/components/common/ChooseWallet/ChooseWallet.ViewModel';
import { rounded } from 'new/utils/NumberExtensions';

export enum CurrencyMode {
  token = 'token',
  fiat = 'fiat',
}

export enum ChooseTokenAndAmountErrorType {
  loadingIsNotCompleted = 'loadingIsNotCompleted',
  destinationWalletIsMissing = 'destinationWalletIsMissing',
  invalidAmount = 'invalidAmount',
  insufficientFunds = 'insufficientFunds',
}

export class ChooseTokenAndAmountError {
  readonly type: ChooseTokenAndAmountErrorType;

  static get loadingIsNotCompleted(): ChooseTokenAndAmountError {
    return new ChooseTokenAndAmountError(ChooseTokenAndAmountErrorType.loadingIsNotCompleted);
  }
  static get destinationWalletIsMissing(): ChooseTokenAndAmountError {
    return new ChooseTokenAndAmountError(ChooseTokenAndAmountErrorType.destinationWalletIsMissing);
  }
  static get invalidAmount(): ChooseTokenAndAmountError {
    return new ChooseTokenAndAmountError(ChooseTokenAndAmountErrorType.invalidAmount);
  }
  static get insufficientFunds(): ChooseTokenAndAmountError {
    return new ChooseTokenAndAmountError(ChooseTokenAndAmountErrorType.insufficientFunds);
  }

  constructor(type: ChooseTokenAndAmountErrorType) {
    this.type = type;
  }

  get buttonSuggestion(): string {
    switch (this.type) {
      case ChooseTokenAndAmountErrorType.loadingIsNotCompleted:
        return 'Loading';
      case ChooseTokenAndAmountErrorType.destinationWalletIsMissing:
        return 'Choose destination wallet';
      case ChooseTokenAndAmountErrorType.invalidAmount:
        return 'Enter the amount to proceed';
      case ChooseTokenAndAmountErrorType.insufficientFunds:
        return 'Insufficient funds';
    }
  }
}

interface SendTokenChooseTokenAndAmountViewModelType {
  selectedNetwork: Network | null;

  wallet: Wallet | null;
  amount: number | null;
  currencyMode: CurrencyMode;
  readonly error: ChooseTokenAndAmountError | null;
}

@injectable()
export class ChooseTokenAndAmountViewModel
  extends ViewModel
  implements SendTokenChooseTokenAndAmountViewModelType
{
  selectedNetwork: Network | null;

  wallet: Wallet | null;
  amount: number;
  currencyMode: CurrencyMode;

  constructor(
    public chooseWalletViewModel: ChooseWalletViewModel,
    @inject(delay(() => SendViewModel)) public sendViewModel: Readonly<SendViewModel>,
  ) {
    super();

    this.wallet = null;
    this.amount = 0;
    this.currencyMode = CurrencyMode.token;

    makeObservable(this, {
      selectedNetwork: observable,

      wallet: observable,
      amount: observable,
      currencyMode: observable,

      error: computed,
      calculateAvailableAmount: computed,

      toggleCurrencyMode: action,
    });
  }

  protected override setDefaults() {
    this.wallet = null;
    this.amount = 0;
    this.currencyMode = CurrencyMode.token;
  }

  protected override onInitialize() {
    this.chooseWalletViewModel.initialize();

    this._bind();
  }

  protected override afterReactionsRemoved() {
    this.chooseWalletViewModel.end();
  }

  private _bind(): void {
    this.addReaction(
      reaction(
        () => this.sendViewModel.wallet,
        (wallet) => {
          this.wallet = wallet;
        },
      ),
    );

    this.addReaction(
      reaction(
        () => this.sendViewModel.amount,
        (amount) => {
          this.amount = amount;
        },
      ),
    );
  }

  get error(): ChooseTokenAndAmountError | null {
    const wallet = this.wallet;
    const amount = this.amount;

    if (!wallet) {
      return ChooseTokenAndAmountError.destinationWalletIsMissing;
    }
    if (!amount || (amount ?? 0) <= 0) {
      return ChooseTokenAndAmountError.invalidAmount;
    }
    if ((amount ?? 0) > (this.calculateAvailableAmount ?? 0)) {
      return ChooseTokenAndAmountError.insufficientFunds;
    }
    return null;
  }

  get calculateAvailableAmount(): number | null {
    const wallet = this.wallet;
    if (!wallet) {
      return null;
    }

    // all amount
    let availableAmount = wallet.amount;

    // convert to fiat in fiat mode
    if (this.currencyMode === CurrencyMode.fiat) {
      availableAmount = rounded(availableAmount * wallet.priceInCurrentFiat, 2);
    }

    Logger.log(`availableAmount ${availableAmount}`, LogEvent.debug);

    return availableAmount;
  }

  isTokenValidForSelectedNetwork(): boolean {
    const isValid =
      this.selectedNetwork !== Network.bitcoin || this.wallet?.token.isRenBTC === true;
    if (!isValid) {
      // TODO:
    }
    return isValid;
  }

  // Actions

  toggleCurrencyMode(): void {
    if (this.currencyMode === CurrencyMode.token) {
      this.currencyMode = CurrencyMode.fiat;
    } else {
      this.currencyMode = CurrencyMode.token;
    }
  }
}
