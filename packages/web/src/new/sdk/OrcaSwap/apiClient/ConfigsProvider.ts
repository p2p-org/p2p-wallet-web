import type { Network } from '@saberhq/solana-contrib';

export interface OrcaSwapConfigsProvider {
  getData<T>(reload: boolean): Promise<T>;
  getConfigs<T>(): Promise<T>;
}

export class NetworkConfigsProvider implements OrcaSwapConfigsProvider {
  network: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cache?: any;
  private _urlString = process.env.REACT_APP_ORCA_CACHE_URL!;

  constructor(network: Network) {
    this.network = network;
  }

  async getData<T>(reload = false): Promise<T> {
    if (!reload && this.cache) {
      return Promise.resolve(this.cache);
    }
    // hack: network
    if (this.network === 'mainnet-beta') {
      this.network = 'mainnet';
    }

    // get
    const data = await (await fetch(`${this._urlString}/info`)).json();

    this.cache = data;

    return Promise.resolve(data);
  }

  async getConfigs<T>(): Promise<T> {
    return this.getData<T>(false);
  }
}
