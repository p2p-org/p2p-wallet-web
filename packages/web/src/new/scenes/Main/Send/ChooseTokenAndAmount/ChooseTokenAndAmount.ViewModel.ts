import { action, computed, makeObservable, observable, reaction } from 'mobx';
import { delay, inject, injectable } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { Network, SendViewModel } from 'new/scenes/Main/Send';
import { ChooseWalletViewModel } from 'new/scenes/Main/Send/ChooseTokenAndAmount/ChooseWallet/ChooseWallet.ViewModel';
import type { Wallet } from 'new/sdk/SolanaSDK';
import { LogEvent, Logger } from 'new/sdk/SolanaSDK';

export enum CurrencyMode {
  token = 'token',
  fiat = 'fiat',
}

// TODO: customize
export enum Error {
  loadingIsNotCompleted = 'loadingIsNotCompleted',
  destinationWalletIsMissing = 'destinationWalletIsMissing',
  invalidAmount = 'invalidAmount',
  insufficientFunds = 'insufficientFunds',
}

interface SendTokenChooseTokenAndAmountViewModelType {
  selectedNetwork: Network | null;

  wallet: Wallet | null;
  amount: number | null;
  currencyMode: CurrencyMode;
  readonly error: Error | null;
}

@injectable()
export class ChooseTokenAndAmountViewModel
  extends ViewModel
  implements SendTokenChooseTokenAndAmountViewModelType
{
  selectedNetwork: Network | null;

  wallet: Wallet | null = null;
  amount = 0;
  currencyMode: CurrencyMode = CurrencyMode.token;

  constructor(
    public chooseWalletViewModel: ChooseWalletViewModel,
    @inject(delay(() => SendViewModel)) public sendViewModel: Readonly<SendViewModel>,
  ) {
    super();

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

  // available amount
  // get balanceText(): string | null {
  //   const wallet = this.wallet;
  //   const mode = this.currencyMode;
  //
  //   if (!wallet) {
  //     return null;
  //   }
  //
  //   const amount = this.calculateAvailableAmount();
  //   if (!amount) {
  //     return null;
  //   }
  //
  //   if (mode === CurrencyMode.fiat) {
  //     return `${amount.toFixed(2)} ${Defaults.fiat.code}`;
  //   }
  //
  //   return amount.formatUnits();
  // }

  get error(): Error | null {
    const wallet = this.wallet;
    const amount = this.amount;

    if (!wallet) {
      return Error.destinationWalletIsMissing;
    }
    if (!amount || (amount ?? 0) <= 0) {
      return Error.invalidAmount;
    }
    if ((amount ?? 0) > (this.calculateAvailableAmount ?? 0)) {
      return Error.insufficientFunds;
    }
    return null;
  }

  get calculateAvailableAmount(): number | null {
    const wallet = this.wallet;
    if (!wallet) {
      return null;
    }

    // all amount
    let availableAmount = wallet.amount.asNumber;

    // convert to fiat in fiat mode
    if (this.currencyMode === CurrencyMode.fiat) {
      availableAmount = availableAmount * wallet.priceInCurrentFiat;
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
