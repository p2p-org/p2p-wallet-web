import { useCallback } from 'react';

import assert from 'ts-invariant';
import { createContainer } from 'unstated-next';

import { MOONPAY_API_KEY, MOONPAY_API_URL } from './constants';
import type {
  MoonpayBaseParams,
  MoonpayErrorResponse,
  MoonpayGetBuyQuoteParams,
  MoonpayGetBuyQuoteResponse,
} from './types';
import { buildParams } from './utils';

const baseParams: MoonpayBaseParams = {
  apiKey: MOONPAY_API_KEY!,
};

export interface UseMoonpay {
  getBuyQuote: (
    amount: string | number,
    isBaseAmountType: boolean,
    currencyCode: string,
    controller: AbortController,
  ) => Promise<MoonpayGetBuyQuoteResponse | MoonpayErrorResponse>;
}

const useMoonpayInternal = (): UseMoonpay => {
  assert(MOONPAY_API_KEY, 'Define moonpay api key in .env');

  const getBuyQuote = useCallback(
    async (
      amount: string | number,
      isBaseAmountType: boolean,
      currencyCode: string,
      controller: AbortController,
    ) => {
      const params: MoonpayGetBuyQuoteParams = {
        ...baseParams,
        baseCurrencyCode: 'usd',
      };

      if (isBaseAmountType) {
        params.baseCurrencyAmount = amount || 0;
      } else {
        params.quoteCurrencyAmount = amount || 0;
      }

      try {
        const res = await fetch(
          `${MOONPAY_API_URL}${currencyCode}/buy_quote?${buildParams(params)}`,
          {
            signal: controller.signal,
          },
        );

        if (!res.ok && res.status !== 400) {
          throw new Error('getBuyQuote something wrong');
        }

        return (await res.json()) as MoonpayGetBuyQuoteResponse | MoonpayErrorResponse;
      } catch (error) {
        throw new Error(`Can't get getBuyQuote: ${error}`);
      }
    },
    [],
  );

  return {
    getBuyQuote,
  };
};

export const { Provider: MoonpayProvider, useContainer: useMoonpay } =
  createContainer(useMoonpayInternal);
