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

  send<T>({ path }: { path: string }): Promise<T> {
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
