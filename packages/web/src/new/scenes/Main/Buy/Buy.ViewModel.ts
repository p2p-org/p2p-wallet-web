import { action, computed, makeObservable, observable, reaction } from 'mobx';
import { injectable } from 'tsyringe';

import { LoadableState } from 'new/app/models/LoadableReleay';
import { ViewModel } from 'new/core/viewmodels/ViewModel';
import { BuyService } from 'new/services/BuyService';
import {
  CryptoCurrency,
  ExchangeInput,
  ExchangeOutput,
  FiatCurrency,
} from 'new/services/BuyService/structures';
import { SolanaService } from 'new/services/SolanaService';

const UPDATE_INTERVAL = 10000;

let _startUpdatingFirstAttemptCall = true;

type CryptoCurrenciesForSelectType = { [key: string]: CryptoCurrency };

@injectable()
export class BuyViewModel extends ViewModel {
  isShowIframe = false;
  input: ExchangeInput = ExchangeInput.zeroInstance(FiatCurrency.usd);
  output: ExchangeOutput = ExchangeOutput.zeroInstance(CryptoCurrency.sol);
  minFiatAmount = 0;
  minCryptoAmount = 0;
  exchangeRate = 0;
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

      loadingState: observable,
      input: observable,
      output: observable,
      crypto: observable,
      minFiatAmount: observable,
      minCryptoAmount: observable,
      exchangeRate: observable,

      changeOutput: action,
      setAmount: action.bound,
      setCryptoCurrency: action,
      setIsShowIframe: action,
      setLoadingState: action,
      swap: action.bound,
    });
  }

  private _startUpdating(): void {
    // guards against this function from being called twice by React's <StrictMode /> tag in developer mode
    if (__DEVELOPMENT__ && _startUpdatingFirstAttemptCall) {
      _startUpdatingFirstAttemptCall = false;
      return;
    }

    this._update();
    this._timer = setInterval(() => {
      this._update();
    }, UPDATE_INTERVAL);
  }

  private _stopUpdating(): void {
    clearInterval(this._timer);

    if (__DEVELOPMENT__) {
      _startUpdatingFirstAttemptCall = true;
    }
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
            this.changeOutput(ExchangeOutput.zeroInstance(this.output.currency));
            this.setLoadingState(LoadableState.loaded);
            return;
          }

          this.setLoadingState(LoadableState.loading);

          this._buyService
            .convert(
              input,
              FiatCurrency.isFiat(input.currency) ? this.crypto : this.output.currency,
            )
            .then((output) => {
              this.setLoadingState(LoadableState.loaded);

              this.changeOutput(output);
            })
            .catch((error) => {
              this.setLoadingState(LoadableState.error(error.response?.data?.message));
              console.error(error.response?.data?.message);
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

  private _update() {
    Promise.all([
      this._buyService.getExchangeRate(FiatCurrency.usd, this.crypto),
      this._buyService.getMinAmount(this.crypto, FiatCurrency.usd),
    ]).then(
      action(([exchangeRate, { minCryptoAmount, minFiatAmount }]) => {
        this.exchangeRate = exchangeRate;

        this.minCryptoAmount = minCryptoAmount;

        const newMinFiatAmount = Number(
          Math.max(Math.ceil(minCryptoAmount * exchangeRate), minFiatAmount).toFixed(2),
        );

        this.minFiatAmount = newMinFiatAmount;
      }),
    );
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

    if (FiatCurrency.isFiat(this.input.currency)) {
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
