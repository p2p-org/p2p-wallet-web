import { injectable } from 'tsyringe';

import { MoonpayProvider } from 'new/services/BuyService/MoonpayProvider';
import type {
  MoonpayErrorResponse,
  MoonpayGetBuyQuoteResponse,
} from 'new/services/BuyService/MoonpayProvider/types';
import type { BuyCurrencyType, ExchangeInput } from 'new/services/BuyService/structures';
import {
  CryptoCurrency,
  ExchangeOutput,
  ExchangeRate,
  FiatCurrency,
} from 'new/services/BuyService/structures';

interface BuyServiceType {
  convert(input: ExchangeInput, currency: BuyCurrencyType): Promise<ExchangeOutput | void>;
  getExchangeRate(
    fiatCurrency: FiatCurrency,
    cryptoCurrency: CryptoCurrency,
  ): Promise<ExchangeRate>;
  getMinAmount(currency: BuyCurrencyType): Promise<number>;
  getMoonpayKeysAreSet(): boolean;
}

@injectable()
export class BuyService implements BuyServiceType {
  constructor(private _provider: MoonpayProvider) {}

  convert(input: ExchangeInput, currency: BuyCurrencyType): Promise<ExchangeOutput | void> {
    const baseCurrencyAmount = input.currency instanceof FiatCurrency ? input.amount : 0;
    const quoteCurrencyAmount = input.currency instanceof CryptoCurrency ? input.amount : 0;

    const baseCurrencyCode = [input.currency, currency].find(
      (currency) => currency instanceof FiatCurrency,
    )!.moonpayCode;

    const quoteCurrencyCode = [input.currency, currency].find(
      (currency) => currency instanceof CryptoCurrency,
    )!.moonpayCode;

    return this._provider
      .getByQuote(baseCurrencyAmount, quoteCurrencyAmount, baseCurrencyCode, quoteCurrencyCode)
      .then((data) => {
        const { message, errors } = data as MoonpayErrorResponse;
        if (errors || message) {
          console.error(`${message}\n${errors}`);
          return;
        }

        const {
          quoteCurrencyPrice,
          quoteCurrencyAmount,
          feeAmount,
          networkFeeAmount,
          totalAmount,
        } = data as MoonpayGetBuyQuoteResponse;

        return new ExchangeOutput(
          currency instanceof CryptoCurrency ? quoteCurrencyAmount : baseCurrencyAmount,
          currency,
          quoteCurrencyPrice,
          feeAmount,
          networkFeeAmount,
          baseCurrencyAmount,
          totalAmount,
        );
      })
      .catch((error) => {
        console.error(error);
      });
  }

  getExchangeRate(
    fiatCurrency: FiatCurrency,
    cryptoCurrency: CryptoCurrency,
  ): Promise<ExchangeRate> {
    return this._provider
      .getPrice(fiatCurrency.moonpayCode, cryptoCurrency.moonpayCode)
      .then((exchangeRate) => new ExchangeRate(exchangeRate || 0, cryptoCurrency, fiatCurrency));
  }

  getMinAmount(currency: BuyCurrencyType): Promise<number> {
    return this._provider
      .getAllCurrencies()
      .then(
        (currencies) =>
          currencies?.find((currencyItem) => currencyItem.code === currency.moonpayCode)
            ?.minBuyAmount ?? 0,
      );
  }

  getMoonpayKeysAreSet(): boolean {
    return this._provider.getMoonpayKeysAreSet();
  }
}
