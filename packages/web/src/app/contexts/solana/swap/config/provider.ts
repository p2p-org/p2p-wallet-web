import { useConnectionContext } from '@p2p-wallet-web/core';
import { formatNetwork } from '@saberhq/solana-contrib';
import { PublicKey } from '@solana/web3.js';
import { createContainer } from 'unstated-next';

import type {
  PoolConfig,
  PoolConfigs,
  PoolJSON,
  PoolJSONS,
  TokenConfigs,
  TokenJSONS,
} from '../orca-commons';
import {
  createPoolConfig,
  createTokenConfig,
  devnetPools,
  devnetProgramIds,
  devnetTokens,
  mainnetPools,
  mainnetProgramIds,
  mainnetTokens,
  testnetPools,
  testnetProgramIds,
  testnetTokens,
} from '../orca-commons';
import { generateRoutes } from './routeGenerator';

const tokens: {
  [cluster: string]: TokenJSONS;
} = {
  devnet: devnetTokens,
  testnet: testnetTokens,
  mainnet: mainnetTokens,
};

const pools: {
  [cluster: string]: PoolJSONS;
} = {
  devnet: devnetPools,
  testnet: testnetPools,
  mainnet: mainnetPools,
};

const programIDS: {
  [cluster: string]: any;
} = {
  devnet: devnetProgramIds,
  testnet: testnetProgramIds,
  mainnet: mainnetProgramIds,
};

export type MintToTokenName = {
  [key: string]: string;
};

export type Route = string[];
export type RouteConfigs = { [key: string]: Route[] };

export type ProgramIds = {
  [key in 'serumTokenSwap' | 'tokenSwapV2' | 'tokenSwap' | 'token']: PublicKey;
};

export interface UseConfig {
  routeConfigs: RouteConfigs;
  tokenConfigs: TokenConfigs;
  poolConfigs: PoolConfigs;
  programIds: ProgramIds;
  mintToTokenName: MintToTokenName;
}

const useConfigInternal = (): UseConfig => {
  const { network: originNetwork } = useConnectionContext();
  const network = formatNetwork(originNetwork);

  const tokenConfigs = createTokenConfig(tokens[network]);

  const orcaConfigs = Object.entries(pools[network]).map(
    ([poolName, obj]: [string, PoolJSON]): [string, PoolConfig] => {
      return [poolName, createPoolConfig(obj)];
    },
  );
  const poolConfigs = Object.fromEntries(orcaConfigs);

  const routeConfigs = generateRoutes(tokenConfigs, poolConfigs);

  const programIds = {
    serumTokenSwap: new PublicKey(programIDS[network].serumTokenSwap),
    tokenSwapV2: new PublicKey(programIDS[network].tokenSwapV2),
    tokenSwap: new PublicKey(programIDS[network].tokenSwap),
    token: new PublicKey(programIDS[network].token),
  };

  const mintToTokenName = Object.entries({
    ...tokenConfigs,
    // ...config.collectibleConfigs,
  }).reduce((mintToTokenName, [tokenName, tokenConfig]) => {
    mintToTokenName[tokenConfig.mint.toBase58()] = tokenName;

    return mintToTokenName;
  }, {} as MintToTokenName);

  return {
    routeConfigs,
    tokenConfigs,
    poolConfigs,
    programIds,
    mintToTokenName,
  };
};

export const { Provider: ConfigProvider, useContainer: useConfig } =
  createContainer(useConfigInternal);

export function useProgramIds() {
  const { programIds } = useConfig();
  return programIds;
}
