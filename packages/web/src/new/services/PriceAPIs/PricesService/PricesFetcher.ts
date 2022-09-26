import type { Token } from 'new/sdk/SolanaSDK';
import { LogEvent, Logger } from 'new/sdk/SolanaSDK';

export abstract class PricesFetcher {
  abstract readonly endpoint: string;
  abstract getCurrentPrices({
    coins,
    fiat,
  }: {
    coins: Token[];
    fiat: string;
  }): Promise<Record<string, CurrentPrice | null>>;

  send<T>({ path }: { path: string }): Promise<T> {
    Logger.log(`${this.endpoint}${path}`, LogEvent.request, 'getPrices');
    return fetch(`${this.endpoint}${path}`).then(async (response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      Logger.log(await response.clone().json(), LogEvent.response, 'getPrices');

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
