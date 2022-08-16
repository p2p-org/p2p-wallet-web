import type { AxiosResponse } from 'axios';
import axios from 'axios';
import assert from 'ts-invariant';
import { injectable } from 'tsyringe';

import {
  MOONPAY_API_KEY,
  MOONPAY_API_URL,
  MOONPAY_SIGNER_URL,
} from 'new/services/BuyService/constants';
import { buildParams } from 'new/services/BuyService/MoonpayProvider/utils';
import type {
  MoonpayBaseParams,
  MoonpayGetAllCurrenciesResponse,
  MoonpayGetBuyQuoteParams,
  MoonpayGetBuyQuoteResponse,
  MoonpayGetPriceResponse,
} from 'new/services/BuyService/types';

const request = axios.create({ baseURL: MOONPAY_API_URL });

const baseParams: MoonpayBaseParams = {
  apiKey: MOONPAY_API_KEY,
};

@injectable()
export class MoonpayProvider {
  private _abortController: AbortController | null = null;

  constructor() {
    assert(MOONPAY_API_KEY, 'Define moonpay api key in .env');
    assert(MOONPAY_SIGNER_URL, 'Define moonpay signer url in .env');
  }

  async getByQuote(
    baseCurrencyAmount: string | number,
    quoteCurrencyAmount: number | string,
    baseCurrencyCode: string,
    quoteCurrencyCode: string,
  ): Promise<MoonpayGetBuyQuoteResponse | void> {
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

    return request(`${quoteCurrencyCode}/buy_quote`, {
      signal: this._abortController.signal,
      params,
    })
      .then((response: AxiosResponse<MoonpayGetBuyQuoteResponse>) => response.data)
      .catch((error) => {
        let mes;
        if (error.response) {
          mes = error.response.data.message;
        } else {
          mes = error.message;
        }
        new Error(mes);
      });
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

      return ((await res.json()) as MoonpayGetPriceResponse)[fiatCurrency.toUpperCase()];
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

  getMoonpayKeysAreSet(): boolean {
    return !!MOONPAY_API_KEY && !!MOONPAY_SIGNER_URL;
  }
}
