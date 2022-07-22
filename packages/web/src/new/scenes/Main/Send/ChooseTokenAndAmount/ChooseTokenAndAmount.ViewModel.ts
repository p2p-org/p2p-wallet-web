import { injectable } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { Network } from 'new/scenes/Main/Send';
import { ChooseWalletViewModel } from 'new/scenes/Main/Send/ChooseTokenAndAmount/ChooseWallet/ChooseWallet.ViewModel';
import type { Wallet } from 'new/sdk/SolanaSDK';
import type * as SolanaSDK from 'new/sdk/SolanaSDK';
import { LogEvent, Logger } from 'new/sdk/SolanaSDK';

export enum CurrencyMode {
  token,
  fiat,
}

interface SendTokenChooseTokenAndAmountViewModelType {
  selectedNetwork: Network | null;

  wallet: Wallet | null;
  amount: number | null;
  currencyMode: CurrencyMode;
}

@injectable()
export class ChooseTokenAndAmountViewModel
  extends ViewModel
  implements SendTokenChooseTokenAndAmountViewModelType
{
  selectedNetwork: Network | null;

  currencyMode: CurrencyMode = CurrencyMode.token;
  wallet: Wallet | null = null;
  amount: number | null = null;

  constructor(public chooseWalletViewModel: ChooseWalletViewModel) {
    super();
  }

  protected override onInitialize() {
    this.chooseWalletViewModel.initialize();
  }

  protected override afterReactionsRemoved() {
    this.chooseWalletViewModel.end();
  }

  // Actions

  toggleCurrencyMode(): void {
    if (this.currencyMode === CurrencyMode.token) {
      this.currencyMode = CurrencyMode.fiat;
    } else {
      this.currencyMode = CurrencyMode.token;
    }
  }

  calculateAvailableAmount(): SolanaSDK.TokenAmount | null {
    const wallet = this.wallet;
    if (!wallet) {
      return null;
    }

    // all amount
    let availableAmount = wallet.amount;

    // convert to fiat in fiat mode
    if (this.currencyMode === CurrencyMode.fiat) {
      availableAmount = availableAmount.multiplyByInteger(wallet.priceInCurrentFiat);
    }

    Logger.log(`availableAmount ${availableAmount.formatUnits()}`, LogEvent.debug);

    return availableAmount;
  }

  isTokenValidForSelectedNetwork(): boolean {
    const isValid =
      this.selectedNetwork !== Network.bitcoin || this.wallet?.token.isRenBTC === true;
    if (!isValid) {
      // TODO:
    }
  }
}
