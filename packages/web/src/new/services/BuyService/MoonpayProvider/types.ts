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

export type MoonpayErrorResponse = {
  type: string;
  message: string;
  errors: [];
};

// GetBuyQuote

export interface MoonpayGetBuyQuoteParams extends MoonpayBaseParams {
  baseCurrencyAmount?: number | string;
  quoteCurrencyAmount?: number | string;
  baseCurrencyCode: string;
  fixed: true;
  regionalPricing: true;
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

export type MoonpayGetPriceResponse = {
  [key: string]: number;
};

export type MoonpayGetAllCurrenciesResponse = Array<{ code: string; minBuyAmount: number }>;
