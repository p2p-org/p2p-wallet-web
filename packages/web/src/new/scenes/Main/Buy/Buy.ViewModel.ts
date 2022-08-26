import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';
import { singleton } from 'tsyringe';

import { LoadableState } from 'new/app/models/LoadableReleay';
import { ViewModel } from 'new/core/viewmodels/ViewModel';
import type { Token } from 'new/sdk/SolanaSDK';
import { BuyService } from 'new/services/BuyService';
import type { CryptoCurrencySymbol } from 'new/services/BuyService/structures';
import {
  CryptoCurrency,
  ExchangeInput,
  ExchangeOutput,
  FiatCurrency,
} from 'new/services/BuyService/structures';
import { LocationService } from 'new/services/LocationService';
import { SolanaService } from 'new/services/SolanaService';

// const UPDATE_INTERVAL = 30 * 1000; // 30 secs
const UPDATE_INTERVAL = 10 * 1000; // 30 secs

type CryptoCurrenciesForSelectType = Record<CryptoCurrencySymbol, CryptoCurrency>;

@singleton()
export class BuyViewModel extends ViewModel {
  isShowIframe!: boolean;
  input!: ExchangeInput;
  output!: ExchangeOutput;
  minFiatAmount!: number;
  minCryptoAmount!: number;
  exchangeRate!: number;
  crypto!: CryptoCurrency;
  loadingState!: LoadableState;

  private _timer?: NodeJS.Timer;

  constructor(
    private _buyService: BuyService,
    private _solanaService: SolanaService,
    private _locationService: LocationService,
  ) {
    super();

    this._setInitValues();

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

  protected override onInitialize() {
    this._setInitValues();

    this._addReactions();

    this._startUpdating();
  }

  protected override afterReactionsRemoved() {
    this._stopUpdating();
  }

  private _setInitValues(): void {
    runInAction(() => {
      this.isShowIframe = false;
      this.input = ExchangeInput.zeroInstance(FiatCurrency.usd);
      this.output = ExchangeOutput.zeroInstance(CryptoCurrency.sol);
      this.minFiatAmount = 0;
      this.minCryptoAmount = 0;
      this.exchangeRate = 0;
      this.crypto = CryptoCurrency.sol;
      this.loadingState = LoadableState.notRequested;
    });
  }

  private _addReactions(): void {
    this.addReaction(
      reaction(
        () => this._locationService.getParams<{ symbol?: CryptoCurrencySymbol }>('/buy/:symbol?'),
        ({ symbol }) => {
          if (symbol) {
            this.setCryptoCurrency(this.cryptoCurrenciesForSelect[symbol]);
          }
        },
      ),
    );

    this.addReaction(
      reaction(
        () => this.crypto,
        () => this._update(),
      ),
    );

    this.addReaction(
      reaction(
        () => ({
          amount: this.input.amount,
          crypto: this.crypto,
        }),
        ({ amount }) => {
          if (amount === 0) {
            this.changeOutput(ExchangeOutput.zeroInstance(this.output.currency));
            this.setLoadingState(LoadableState.loaded);
            return;
          }

          this.setLoadingState(LoadableState.loading);

          this._buyService
            .convert(this.input, this.output)
            .then((output) => {
              this.setLoadingState(LoadableState.loaded);
              this.changeOutput(output);
            })
            .catch((error) => {
              this.setLoadingState(LoadableState.error(error.message));
              this.changeOutput(ExchangeOutput.zeroInstance(this.output.currency));
            });
        },
      ),
    );
  }

  private _startUpdating(): void {
    this._update();

    this._timer = setInterval(() => {
      this._update();
    }, UPDATE_INTERVAL);
  }

  private _stopUpdating(): void {
    clearInterval(this._timer);
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

  private _update(): void {
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

  getToken(mint: string): Promise<Token | undefined> {
    return this._solanaService.getToken(mint);
  }

  changeOutput(output: ExchangeOutput): void {
    this.output = output;
  }

  setAmount(amount: string): void {
    const newAmount = Number(amount);
    if (newAmount === this.input.amount) {
      return;
    }

    this.input = new ExchangeInput(newAmount, this.input.currency);
  }

  setCryptoCurrency(cryptoCurrency: CryptoCurrency): void {
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

  setIsShowIframe(value: boolean): void {
    this.isShowIframe = value;
  }

  setLoadingState(value: LoadableState): void {
    this.loadingState = value;
  }

  swap(): void {
    const { input, output } = this.input.swap(this.output);
    this.input = input;
    this.output = output;
  }
}
