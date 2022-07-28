import { action, makeObservable, observable, reaction } from 'mobx';
import { injectable } from 'tsyringe';

import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { BuyService } from 'new/services/BuyService';
import type { ExchangeRate } from 'new/services/BuyService/structures';
import {
  CryptoCurrency,
  ExchangeInput,
  ExchangeOutput,
  FiatCurrency,
} from 'new/services/BuyService/structures';

@injectable()
export class BuyViewModel extends ViewModel {
  input: ExchangeInput = new ExchangeInput(0, FiatCurrency.usd);
  output: ExchangeOutput = new ExchangeOutput(0, CryptoCurrency.sol, 0, 0, 0, 0);
  minFiatAmount = 0;
  minCryptoAmount = 0;
  exchageRate: ExchangeRate | null = null;
  crypto: CryptoCurrency = CryptoCurrency.sol;

  private _timer: NodeJS.Timer;

  constructor(private _buyService: BuyService) {
    super();

    makeObservable({
      input: observable,
      output: observable,
      crypto: observable,

      update: action,
      changeOutput: action,
      setAmount: action,
      swap: action,
    });
  }

  protected override onInitialize() {
    this._timer = setInterval(() => this._update());

    this.addReaction(
      reaction(
        () => ({
          input: this.input,
          exchageRate: this.exchageRate,
          minFiatAmount: this.minFiatAmount,
          minCryptoAmount: this.minCryptoAmount,
        }),
        ({ input }) => {
          if (input.amount === 0) {
            this.changeOutput(new ExchangeOutput(0, this.output.currency, 0, 0, 0, 0));
            return;
          }

          this._buyService
            .convert(input, input.currency instanceof FiatCurrency ? this.crypto : input.currency)
            .then((output) => this.changeOutput(output!))
            .catch(() =>
              this.changeOutput(new ExchangeOutput(0, this.output.currency, 0, 0, 0, 0)),
            );
        },
      ),
    );
  }

  protected override afterReactionsRemoved() {}

  protected override onEnd() {
    super.onEnd();

    clearInterval(this._timer);
  }

  private _update() {
    Promise.all([
      this._buyService.getExchangeRate(FiatCurrency.usd, this.crypto),
      this._buyService.getMinAmount(this.crypto),
      this._buyService.getMinAmount(FiatCurrency.usd),
    ]).then(([exchangeRate, minCryptoAmount, minFiatAmount]) => {
      this.exchageRate = exchangeRate;
      this.minCryptoAmount = minCryptoAmount;

      const newMinFiatAmount = Number(
        Math.max(Math.ceil(minCryptoAmount * exchangeRate.amount), minFiatAmount).toFixed(2),
      );

      this.minFiatAmount = newMinFiatAmount;
    });
  }

  changeOutput(output: ExchangeOutput) {
    this.output = output;
  }

  setAmount(amount: number) {
    if (amount === this.input.amount) {
      return;
    }

    this.input = new ExchangeInput(amount, this.input.currency);
  }

  swap() {
    const { input, output } = this.input.swap(this.output);
    this.input = input;
    this.output = output;
  }
}
