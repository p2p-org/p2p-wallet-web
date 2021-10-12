import { useSelector } from 'react-redux';

import { PublicKey } from '@solana/web3.js';
import { createContainer } from 'unstated-next';

import type {
  AquafarmJSONS,
  PoolConfig,
  PoolConfigs,
  PoolJSON,
  TokenConfigs,
  TokenJSONS,
} from '../orca-commons';
import {
  createAquafarmConfig,
  createPoolConfig,
  createTokenConfig,
  devnetAquafarms,
  devnetPools,
  devnetProgramIds,
  devnetTokens,
  mainnetAquafarms,
  mainnetPools,
  mainnetProgramIds,
  mainnetTokens,
  PoolJSONS,
  testnetAquafarms,
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

const aquafarms: {
  [cluster: string]: AquafarmJSONS;
} = {
  devnet: devnetAquafarms,
  testnet: testnetAquafarms,
  mainnet: mainnetAquafarms,
};

export type MintToTokenName = {
  [key: string]: string;
};

export type Route = string[];
export type RouteConfigs = { [key: string]: Route[] };

export type ProgramIds = { [key: string]: PublicKey };

export interface UseConfig {
  routeConfigs: RouteConfigs;
  tokenConfigs: TokenConfigs;
  poolConfigs: PoolConfigs;
  programIds: ProgramIds;
  mintToTokenName: MintToTokenName;
}

// TODO: hack
function correctCluster(cluster: string) {
  if (cluster === 'mainnet-beta') {
    return 'mainnet';
  }

  return cluster;
}

const useConfigInternal = (): UseConfig => {
  const network = useSelector((state) => correctCluster(state.wallet.network.cluster)); // getReactNetworkName();

  const tokenConfigs = createTokenConfig(tokens[network]) as TokenConfigs;

  const aquafarmConfigs = Object.fromEntries(
    Object.entries(aquafarms[network]).map(([poolAddress, obj]) => {
      return [poolAddress, createAquafarmConfig(obj)];
    }),
  );
  const orcaConfigs = Object.entries(pools[network]).map(([poolName, obj]: [string, PoolJSON]): [
    string,
    PoolConfig,
  ] => {
    const aquafarmConfig = aquafarmConfigs[obj.account] || null;
    return [poolName, createPoolConfig(obj, aquafarmConfig)];
  });
  const poolConfigs = Object.fromEntries(orcaConfigs);

  const routeConfigs = generateRoutes(tokenConfigs, poolConfigs);

  const programIds = {
    serumTokenSwap: new PublicKey(programIDS[network].serumTokenSwap),
    tokenSwapV2: new PublicKey(programIDS[network].tokenSwapV2),
    tokenSwap: new PublicKey(programIDS[network].tokenSwap),
    token: new PublicKey(programIDS[network].token),
    aquafarm: new PublicKey(programIDS[network].aquafarm),
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

export const { Provider: ConfigProvider, useContainer: useConfig } = createContainer(
  useConfigInternal,
);

export function useProgramIds() {
  const { programIds } = useConfig();
  return programIds;
}
