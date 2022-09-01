import { plainToClass } from 'class-transformer';

import type { ProgramIDS, TokenValue } from 'new/sdk/OrcaSwap';
import { OrcaInfoResponse } from 'new/sdk/OrcaSwap';

import type { Pool } from '../models/Pool';
import type { OrcaSwapConfigsProvider } from './ConfigsProvider';

interface OrcaSwapAPIClient {
  readonly configProvider: OrcaSwapConfigsProvider;
  reload(): Promise<void>;
  getTokens(): Promise<Map<string, TokenValue>>;
  getPools(): Promise<Map<string, Pool>>;
  getProgramID(): Promise<ProgramIDS>;
}

export class APIClient implements OrcaSwapAPIClient {
  configProvider: OrcaSwapConfigsProvider;

  constructor(configsProvider: OrcaSwapConfigsProvider) {
    this.configProvider = configsProvider;
  }

  async reload(): Promise<void> {
    await this.configProvider.getData(true);
  }

  async getTokens(): Promise<Map<string, TokenValue>> {
    const data = await this.configProvider.getConfigs<OrcaInfoResponse>();
    const response = plainToClass(OrcaInfoResponse, data);
    return response.value.tokens;
  }

  async getPools(): Promise<Map<string, Pool>> {
    const data = await this.configProvider.getConfigs<OrcaInfoResponse>();
    const response = plainToClass(OrcaInfoResponse, data);
    return response.value.pools;
  }

  async getProgramID(): Promise<ProgramIDS> {
    const data = await this.configProvider.getConfigs<OrcaInfoResponse>();
    const response = plainToClass(OrcaInfoResponse, data);
    return response.value.programIds;
  }
}
