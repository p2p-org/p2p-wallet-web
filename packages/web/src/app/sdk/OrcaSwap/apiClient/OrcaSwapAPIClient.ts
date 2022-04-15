import type { Network } from '@saberhq/solana-contrib';
import { formatNetwork } from '@saberhq/solana-contrib';
import { mapObjIndexed } from 'ramda';

import type { OrcaSwapPoolResponse } from '../models/OrcaSwapPool';
import { OrcaSwapPool } from '../models/OrcaSwapPool';
import type { Pools } from '../models/OrcaSwapPools';
import type { OrcaSwapProgramIDResponse } from '../models/OrcaSwapProgramID';
import { OrcaSwapProgramID } from '../models/OrcaSwapProgramID';
import type { OrcaSwapTokens, OrcaSwapTokensResponse } from '../models/OrcaSwapToken';
import { OrcaSwapToken } from '../models/OrcaSwapToken';
import {
  devnetPools,
  devnetProgramIds,
  devnetTokens,
  mainnetPools,
  mainnetProgramIds,
  mainnetTokens,
  testnetPools,
  testnetProgramIds,
  testnetTokens,
} from './data';

const tokens: {
  [cluster: string]: Record<string, OrcaSwapTokensResponse>;
} = {
  devnet: devnetTokens,
  testnet: testnetTokens,
  mainnet: mainnetTokens,
};

const pools: {
  [cluster: string]: Record<string, OrcaSwapPoolResponse>;
} = {
  devnet: devnetPools,
  testnet: testnetPools,
  mainnet: mainnetPools,
};

const programIDS: {
  [cluster: string]: OrcaSwapProgramIDResponse;
} = {
  devnet: devnetProgramIds,
  testnet: testnetProgramIds,
  mainnet: mainnetProgramIds,
};

export class OrcaSwapAPIClient {
  constructor(public network: Network) {}

  getTokens(): OrcaSwapTokens {
    const response = tokens[this._getNetwork()]!;
    return mapObjIndexed((value) => OrcaSwapToken.fromNetwork(value), response);
  }

  getPools(): Pools {
    const response = pools[this._getNetwork()]!;
    return mapObjIndexed((value) => OrcaSwapPool.fromNetwork(value), response);
  }

  getProgramID() {
    const response = programIDS[this._getNetwork()]!;
    return OrcaSwapProgramID.fromNetwork(response);
  }

  private _getNetwork() {
    return formatNetwork(this.network);
  }
}
