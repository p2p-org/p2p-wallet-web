export type CandlesCryptoCompareResponse = {
  Data: {
    Data: {
      close: number;
      open: number;
      low: number;
      high: number;
      time: number;
    }[];
  };
};

export type CandleLimitType = 'last1h' | 'last4h' | 'day' | 'week' | 'month';

export type CandleRate = {
  price: number;
  startTime: number;
};

export type Candles = {
  [pair: string]: CandleRate[];
};

export type OrderbooksCryptoCompareResponse = {
  [market: string]: {
    [currency: string]: number;
  };
};

export type Market = number | null | undefined;

export type Markets = {
  [pair: string]: Market;
};
