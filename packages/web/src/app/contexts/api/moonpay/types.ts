// Base

export type MoonpayBaseParams = {
  apiKey: string;
};

// Iframe

export interface MoonpayIframeParams extends MoonpayBaseParams {
  currencyCode: string;
  baseCurrencyAmount: number | string;
  baseCurrencyCode: 'usd';
  lockAmount: boolean;
  walletAddress?: string;
}

// Errors

export enum MoonpayErrorResponseType {
  BadRequestError = 'BadRequestError',
}

export type MoonpayErrorResponse = {
  type: MoonpayErrorResponseType;
  message: string;
};

// GetBuyQuote

export interface MoonpayGetBuyQuoteParams extends MoonpayBaseParams {
  baseCurrencyAmount: number | string;
  quoteCurrencyAmount: number | string;
  baseCurrencyCode: 'usd';
  paymentMethod?: 'credit_debit_card';
  extraFeePercentage?: number;
}

export type MoonpayGetBuyQuoteResponse = {
  baseCurrencyAmount: number;
  quoteCurrencyAmount: number;
  quoteCurrencyPrice: number;
  quoteCurrencyCode: string;
  feeAmount: number;
  networkFeeAmount: number;
  totalAmount: number;
};
