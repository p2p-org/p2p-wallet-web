import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';
import { singleton } from 'tsyringe';

import { LoadableState } from 'new/app/models/LoadableRelay';
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
import { TokensRepository } from 'new/services/Repositories';
import { SolanaService } from 'new/services/SolanaService';
import { numberToString } from 'new/utils/NumberExtensions';

const UPDATE_INTERVAL = 10 * 1000; // 10 secs

type CryptoCurrenciesForSelectType = Record<CryptoCurrencySymbol, CryptoCurrency>;

@singleton()
export class BuyViewModel extends ViewModel {
  isShowIframe: boolean;
  input: ExchangeInput;
  output: ExchangeOutput;
  minFiatAmount: number;
  minCryptoAmount: number;
  exchangeRate: number;
  crypto: CryptoCurrency;
  loadingState: LoadableState;

  private _timer?: NodeJS.Timer;

  constructor(
    private _buyService: BuyService,
    private _solanaService: SolanaService,
    private _locationService: LocationService,
    private _tokensRepository: TokensRepository,
  ) {
    super();

    this.isShowIframe = false;
    this.input = ExchangeInput.zeroInstance(FiatCurrency.usd);
    this.output = ExchangeOutput.zeroInstance(CryptoCurrency.sol);
    this.minFiatAmount = 0;
    this.minCryptoAmount = 0;
    this.exchangeRate = 0;
    this.crypto = CryptoCurrency.sol;
    this.loadingState = LoadableState.notRequested;

    makeObservable(this, {
      isShowIframe: observable,
      areMoonpayConstantsSet: computed,
      cryptoCurrenciesForSelect: computed,

      loadingState: observable,
      input: observable,
      output: observable,
      crypto: observable,
      minFiatAmount: observable,
      minCryptoAmount: observable,
      exchangeRate: observable,

      setAmount: action.bound,
      setIsShowIframe: action,
      swap: action.bound,
    });
  }

  protected override setDefaults() {
    this.isShowIframe = false;
    this.input = ExchangeInput.zeroInstance(FiatCurrency.usd);
    this.output = ExchangeOutput.zeroInstance(CryptoCurrency.sol);
    this.minFiatAmount = 0;
    this.minCryptoAmount = 0;
    this.exchangeRate = 0;
    this.crypto = CryptoCurrency.sol;
    this.loadingState = LoadableState.notRequested;
  }

  protected override onInitialize() {
    this._addReactions();

    this._startUpdating();
  }

  protected override afterReactionsRemoved() {
    this._stopUpdating();
  }

  private _addReactions(): void {
    this.addReaction(
      reaction(
        () => this._getSymbolFromParams(),
        (symbol) => {
          if (symbol) {
            this._setCryptoCurrency(this.cryptoCurrenciesForSelect[symbol]);
          }
        },
        {
          fireImmediately: true,
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
            this._changeOutput(ExchangeOutput.zeroInstance(this.output.currency));
            this._setLoadingState(LoadableState.loaded);
            return;
          }

          this._setLoadingState(LoadableState.loading);

          this._buyService
            .convert(this.input, this.output)
            .then((output) => {
              this._setLoadingState(LoadableState.loaded);
              this._changeOutput(output);
            })
            .catch((error) => {
              this._setLoadingState(LoadableState.error(error.message));
              this._changeOutput(ExchangeOutput.zeroInstance(this.output.currency));
            });
        },
      ),
    );
  }

  private _getSymbolFromParams(): CryptoCurrencySymbol {
    return (
      this._locationService.getParams<{ symbol?: CryptoCurrencySymbol }>('/buy/:symbol?').symbol ||
      'SOL'
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

  private _update(): void {
    Promise.all([
      this._buyService.getExchangeRate(FiatCurrency.usd, this.crypto),
      this._buyService.getMinAmount(this.crypto, FiatCurrency.usd),
    ]).then(
      action(([exchangeRate, { minCryptoAmount, minFiatAmount }]) => {
        this.exchangeRate = exchangeRate;

        this.minCryptoAmount = minCryptoAmount;

        const newMinFiatAmount = Number(
          numberToString(Math.max(Math.ceil(minCryptoAmount * exchangeRate), minFiatAmount), {
            maximumFractionDigits: 2,
          }),
        );

        this.minFiatAmount = newMinFiatAmount;
      }),
    );
  }

  private _changeOutput(output: ExchangeOutput): void {
    runInAction(() => (this.output = output));
  }

  private _setCryptoCurrency(cryptoCurrency: CryptoCurrency): void {
    runInAction(() => {
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
    });
  }

  private _setLoadingState(value: LoadableState): void {
    runInAction(() => (this.loadingState = value));
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

  get pubkeyBase58(): string {
    return this._solanaService.provider.wallet.publicKey.toBase58();
  }

  getTokenWithMint(mint: string): Promise<Token | undefined> {
    return this._tokensRepository.getTokenWithMint(mint);
  }

  setAmount(amount: string): void {
    const newAmount = Number(amount);
    if (newAmount === this.input.amount) {
      return;
    }

    this.input = new ExchangeInput(newAmount, this.input.currency);
  }

  setIsShowIframe(value: boolean): void {
    this.isShowIframe = value;
  }

  swap(): void {
    const { input, output } = this.input.swap(this.output);
    this.input = input;
    this.output = output;
  }
}
