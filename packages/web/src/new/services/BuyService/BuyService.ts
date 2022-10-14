import { injectable } from 'tsyringe';

import { MoonpayProvider } from 'new/services/BuyService/MoonpayProvider';
import type { ExchangeInput } from 'new/services/BuyService/structures';
import { CryptoCurrency, ExchangeOutput, FiatCurrency } from 'new/services/BuyService/structures';
import type { MoonpayGetBuyQuoteResponse } from 'new/services/BuyService/types';

interface BuyServiceType {
  convert(input: ExchangeInput, output: ExchangeOutput): Promise<ExchangeOutput | void>;
  getExchangeRate(fiatCurrency: FiatCurrency, cryptoCurrency: CryptoCurrency): Promise<number>;
  getMinAmount(
    cryptoCurrency: CryptoCurrency,
    fiatCurrency: FiatCurrency,
  ): Promise<{ minCryptoAmount: number; minFiatAmount: number }>;
  getMoonpayKeysAreSet(): boolean;
}

@injectable()
export class BuyService implements BuyServiceType {
  constructor(private _provider: MoonpayProvider) {}

  convert(input: ExchangeInput, output: ExchangeOutput): Promise<ExchangeOutput> {
    const baseCurrencyAmountForRequest = FiatCurrency.isFiat(input.currency) ? input.amount : 0;
    const quoteCurrencyAmountForRequest = CryptoCurrency.isCrypto(input.currency)
      ? input.amount
      : 0;

    const baseCurrencyCode = [input.currency, output.currency].find((currency) =>
      FiatCurrency.isFiat(currency),
    )!.moonpayCode;

    const quoteCurrencyCode = [input.currency, output.currency].find((currency) =>
      CryptoCurrency.isCrypto(currency),
    )!.moonpayCode;

    return this._provider
      .getByQuote(
        baseCurrencyAmountForRequest,
        quoteCurrencyAmountForRequest,
        baseCurrencyCode,
        quoteCurrencyCode,
      )
      .then((data) => {
        const {
          quoteCurrencyPrice,
          quoteCurrencyAmount,
          baseCurrencyAmount,
          feeAmount,
          networkFeeAmount,
          totalAmount,
        } = data as MoonpayGetBuyQuoteResponse;

        return new ExchangeOutput(
          CryptoCurrency.isCrypto(output.currency) ? quoteCurrencyAmount : baseCurrencyAmount,
          output.currency,
          quoteCurrencyPrice,
          feeAmount,
          networkFeeAmount,
          baseCurrencyAmount,
          totalAmount,
        );
      });
  }

  getExchangeRate(fiatCurrency: FiatCurrency, cryptoCurrency: CryptoCurrency): Promise<number> {
    return this._provider
      .getPrice(fiatCurrency.moonpayCode, cryptoCurrency.moonpayCode)
      .then((exchangeRate) => exchangeRate || 0);
  }

  getMinAmount(
    cryptoCurrency: CryptoCurrency,
    fiatCurrency: FiatCurrency,
  ): Promise<{ minCryptoAmount: number; minFiatAmount: number }> {
    return this._provider.getAllCurrencies().then((currencies) => ({
      minCryptoAmount:
        currencies?.find((currencyItem) => currencyItem.code === cryptoCurrency.moonpayCode)
          ?.minBuyAmount || 0,
      minFiatAmount:
        currencies?.find((currencyItem) => currencyItem.code === fiatCurrency.moonpayCode)
          ?.minBuyAmount || 0,
    }));
  }

  getMoonpayKeysAreSet(): boolean {
    return this._provider.getMoonpayKeysAreSet();
  }
}