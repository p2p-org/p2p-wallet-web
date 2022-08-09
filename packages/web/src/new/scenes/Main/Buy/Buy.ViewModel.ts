import { action, computed, makeObservable, observable, reaction } from 'mobx';
import { injectable } from 'tsyringe';

import { LoadableState } from 'new/app/models/LoadableReleay';
import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { CryptoCurrenciesForSelectType } from 'new/scenes/Main/Buy/types';
import { BuyService } from 'new/services/BuyService';
import type { ExchangeRate } from 'new/services/BuyService/structures';
import {
  CryptoCurrency,
  ExchangeInput,
  ExchangeOutput,
  FiatCurrency,
} from 'new/services/BuyService/structures';
import { SolanaService } from 'new/services/SolanaService';

const UPDATE_INTERVAL = 10000;

@injectable()
export class BuyViewModel extends ViewModel {
  isShowIframe = false;
  input: ExchangeInput = new ExchangeInput(0, FiatCurrency.usd);
  output: ExchangeOutput = new ExchangeOutput(0, CryptoCurrency.sol, 0, 0, 0, 0, 0);
  minFiatAmount = 0;
  minCryptoAmount = 0;
  exchangeRate: ExchangeRate | null = null;
  crypto: CryptoCurrency = CryptoCurrency.sol;
  loadingState = LoadableState.notRequested;

  private _timer?: NodeJS.Timer;

  constructor(private _buyService: BuyService, private _solanaService: SolanaService) {
    super();

    makeObservable(this, {
      isShowIframe: observable,
      areMoonpayConstantsSet: computed,
      cryptoCurrenciesForSelect: computed,
      publicKeyString: computed,

      input: observable,
      output: observable,
      crypto: observable,
      loadingState: observable,

      update: action,
      changeOutput: action,
      setAmount: action.bound,
      setCryptoCurrency: action,
      setIsShowIframe: action,
      setLoadingState: action,
      swap: action.bound,
    });
  }

  private _startUpdating(): void {
    this.update();
    this._timer = setInterval(() => {
      this.update();
    }, UPDATE_INTERVAL);
  }

  private _stopUpdating(): void {
    clearInterval(this._timer);
  }

  protected override onInitialize() {
    this.addReaction(
      reaction(
        () => ({
          input: this.input,
          crypto: this.crypto,
          exchangeRate: this.exchangeRate,
          minFiatAmount: this.minFiatAmount,
          minCryptoAmount: this.minCryptoAmount,
        }),
        ({ input }) => {
          if (input.amount === 0) {
            this.changeOutput(new ExchangeOutput(0, this.output.currency, 0, 0, 0, 0, 0));
            this.setLoadingState(LoadableState.loaded);
            return;
          }

          this.setLoadingState(LoadableState.loading);

          this._buyService
            .convert(
              input,
              input.currency instanceof FiatCurrency ? this.crypto : this.output.currency,
            )
            .then((output) => {
              this.setLoadingState(LoadableState.loaded);

              if (output) {
                this.changeOutput(output);
              } else {
                this.changeOutput(new ExchangeOutput(0, this.output.currency, 0, 0, 0, 0, 0));
              }
            });
        },
      ),
    );

    this._startUpdating();
  }

  protected override afterReactionsRemoved() {
    this._stopUpdating();
  }

  get areMoonpayConstantsSet(): boolean {
    return this._buyService.getMoonpayKeysAreSet();
  }

  get cryptoCurrenciesForSelect(): CryptoCurrenciesForSelectType {
    return {
      SOL: CryptoCurrency.sol,
      USDC: CryptoCurrency.usdc,
    };
  }

  get publicKeyString(): string {
    return this._solanaService.provider.wallet.publicKey.toBase58();
  }

  update() {
    Promise.all([
      this._buyService.getExchangeRate(FiatCurrency.usd, this.crypto),
      this._buyService.getMinAmount(this.crypto),
      this._buyService.getMinAmount(FiatCurrency.usd),
    ]).then(([exchangeRate, minCryptoAmount, minFiatAmount]) => {
      this.exchangeRate = exchangeRate;
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

  setAmount(amount: string) {
    const newAmount = Number(amount);
    if (newAmount === this.input.amount) {
      return;
    }

    this.input = new ExchangeInput(newAmount, this.input.currency);
  }

  setCryptoCurrency(cryptoCurrency: CryptoCurrency) {
    this.crypto = cryptoCurrency;

    if (this.input.currency instanceof FiatCurrency) {
      const { amount, price, networkFee, processingFee, purchaseCost, total } = this.output;
      this.output = new ExchangeOutput(
        amount,
        cryptoCurrency,
        price,
        processingFee,
        networkFee,
        purchaseCost,
        total,
      );
    } else {
      this.input = new ExchangeInput(this.input.amount, cryptoCurrency);
    }
  }

  setIsShowIframe(value: boolean) {
    this.isShowIframe = value;
  }

  setLoadingState(value: LoadableState) {
    this.loadingState = value;
  }

  swap() {
    const { input, output } = this.input.swap(this.output);
    this.input = input;
    this.output = output;
  }
}
