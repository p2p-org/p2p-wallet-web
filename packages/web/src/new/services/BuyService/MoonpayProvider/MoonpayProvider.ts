import assert from 'ts-invariant';
import { injectable } from 'tsyringe';

import { MOONPAY_API_KEY, MOONPAY_API_URL } from 'new/services/BuyService/constants';
import type {
  MoonpayBaseParams,
  MoonpayErrorResponse,
  MoonpayGetAllCurrenciesResponse,
  MoonpayGetBuyQuoteParams,
  MoonpayGetBuyQuoteResponse,
  MoonpayGetPriceResponse,
} from 'new/services/BuyService/MoonpayProvider/types';
import { buildParams } from 'new/services/BuyService/MoonpayProvider/utils';

const baseParams: MoonpayBaseParams = {
  apiKey: MOONPAY_API_KEY,
};

@injectable()
export class MoonpayProvider {
  private _abortController: AbortController | null = null;

  constructor() {
    assert(MOONPAY_API_KEY, 'Define moonpay api key in .env');
  }

  async getByQuote(
    baseCurrencyAmount: string | number,
    quoteCurrencyAmount: number | string,
    baseCurrencyCode: string,
    quoteCurrencyCode: string,
  ): Promise<MoonpayGetBuyQuoteResponse | MoonpayErrorResponse> {
    try {
      this._abortController?.abort();
    } finally {
      this._abortController = new AbortController();
    }

    const params: MoonpayGetBuyQuoteParams = {
      ...baseParams,
      baseCurrencyAmount,
      quoteCurrencyAmount,
      baseCurrencyCode,
      fixed: true,
      regionalPricing: true,
    };

    try {
      const res = await fetch(
        `${MOONPAY_API_URL}${quoteCurrencyCode}/buy_quote?${buildParams(params)}`,
        {
          signal: this._abortController.signal,
        },
      );

      if (!res.ok && res.status !== 400) {
        throw new Error('getBuyQuote something wrong');
      }

      return await res.json();
    } catch (error) {
      throw new Error(`Can't get getBuyQuote: ${error}`);
    }
  }

  async getPrice(fiatCurrency: string, cryptoCurrency: string): Promise<number | undefined> {
    const params: MoonpayBaseParams = {
      ...baseParams,
    };

    try {
      const res = await fetch(
        `${MOONPAY_API_URL}${cryptoCurrency}/ask_price?${buildParams(params)}`,
      );

      if (!res.ok && res.status !== 400) {
        throw new Error('getPrice something wrong');
      }

      return ((await res.json()) as MoonpayGetPriceResponse)[fiatCurrency];
    } catch (error) {
      throw new Error(`Can't get getPrice: ${error}`);
    }
  }

  async getAllCurrencies(): Promise<MoonpayGetAllCurrenciesResponse> {
    const params: MoonpayBaseParams = {
      ...baseParams,
    };

    try {
      const res = await fetch(`${MOONPAY_API_URL}?${buildParams(params)}`);

      if (!res.ok && res.status !== 400) {
        throw new Error('getAllCurrencies something wrong');
      }

      return await res.json();
    } catch (error) {
      throw new Error(`Can't get getAllCurrencies: ${error}`);
    }
  }

  getMoonpayAPIKeyIsSet(): boolean {
    return !!MOONPAY_API_KEY;
  }
}
