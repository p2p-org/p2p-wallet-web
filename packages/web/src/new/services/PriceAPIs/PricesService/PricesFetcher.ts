import { LogEvent, Logger } from 'new/app/sdk/SolanaSDK';

export abstract class PricesFetcher {
  abstract readonly endpoint: string;
  abstract getCurrentPrices({
    coins,
    toFiat,
  }: {
    coins: string[];
    toFiat: string;
  }): Promise<{ [key in string]: CurrentPrice | null }>;
  // abstract getHistoricalPrice({
  //   coinName,
  //   fiat,
  //   period,
  // }: {
  //   coinName: string;
  //   fiat: string;
  //   period: Period;
  // }): Promise<PriceRecord[]>;
  // abstract getValueInUSD(fiat: string): Promise<number | null>;

  send<T>({
    path,
  }: // decodedTo,
  {
    path: string;
    // decodedTo: { decode(data: Buffer): T };
  }): Promise<T> {
    Logger.log(`${this.endpoint}${path}`, LogEvent.request, 'getPrices');
    return fetch(`${this.endpoint}${path}`).then(async (response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      Logger.log(await response.clone().text(), LogEvent.response, 'getPrices');

      return response.json();
    });
  }
}

interface Change24h {
  value?: number;
  percentage?: number;
}
export interface CurrentPrice {
  value?: number;
  change24h?: Change24h;
}

// class PriceRecord {
//   close: number;
//   open: number;
//   low: number;
//   high: number;
//   startTime: number;
//
//   constructor({
//     close,
//     open,
//     low,
//     high,
//     startTime,
//   }: {
//     close: number;
//     open: number;
//     low: number;
//     high: number;
//     startTime: number;
//   }) {
//     this.close = close;
//     this.open = open;
//     this.low = low;
//     this.high = high;
//     this.startTime = startTime;
//   }
//
//   converting(exchangeRate: number): PriceRecord {
//     return new PriceRecord({
//       close: this.close * exchangeRate,
//       open: this.open * exchangeRate,
//       low: this.low * exchangeRate,
//       high: this.high * exchangeRate,
//       startTime: this.startTime * exchangeRate,
//     });
//   }
// }

// enum Period {
//   last1h,
//   last4h,
//   day,
//   week,
//   month,
// }
