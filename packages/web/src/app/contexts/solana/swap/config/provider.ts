import { useEffect, useState } from 'react';

import { PublicKey } from '@solana/web3.js';
import { createContainer } from 'unstated-next';

import type {
  CloudFlareOrcaCache,
  PoolConfig,
  PoolConfigs,
  PoolJSON,
  ProgramIds as ProgramIdNames,
  TokenConfigs,
} from '../orca-commons';
import { createPoolConfig, createTokenConfig } from '../orca-commons';
import { generateRoutes } from './routeGenerator';

export type MintToTokenName = {
  [key: string]: string;
};

export type Route = string[];
export type RouteConfigs = { [key: string]: Route[] };

export type ProgramIds = {
  [key in ProgramIdNames]: PublicKey;
};

export interface UseConfig {
  routeConfigs: RouteConfigs;
  tokenConfigs: TokenConfigs;
  poolConfigs: PoolConfigs;
  programIds: ProgramIds;
  mintToTokenName: MintToTokenName;
}

const ORCA_WORKER_URL = 'https://orca.wallet.p2p.org/info';

const useConfigInternal = (): UseConfig => {
  const [orcaData, setOrcaData] = useState<CloudFlareOrcaCache | null>(null);

  useEffect(() => {
    fetch(ORCA_WORKER_URL)
      .then((resp) => resp.json())
      .then(setOrcaData);
  }, []);

  // @FIXME very ugly thing
  if (!orcaData) {
    return {
      routeConfigs: {},
      tokenConfigs: {},
      poolConfigs: {},
      programIds: {},
      mintToTokenName: {},
    };
  }

  const tokenConfigs = createTokenConfig(orcaData.value.tokens);

  const orcaConfigs = Object.entries(orcaData.value.pools).map(
    ([poolName, obj]: [string, PoolJSON]): [string, PoolConfig] => {
      return [poolName, createPoolConfig(obj)];
    },
  );
  const poolConfigs = Object.fromEntries(orcaConfigs);

  const routeConfigs = generateRoutes(tokenConfigs, poolConfigs);

  const programIds = {
    serumTokenSwap: new PublicKey(orcaData.value.programIds.serumTokenSwap),
    tokenSwapV2: new PublicKey(orcaData.value.programIds.tokenSwapV2),
    tokenSwap: new PublicKey(orcaData.value.programIds.tokenSwap),
    token: new PublicKey(orcaData.value.programIds.token),
  };

  const mintToTokenName = Object.entries({
    ...tokenConfigs,
    // ...config.collectibleConfigs,
  }).reduce((mintTo, [tokenName, tokenConfig]) => {
    mintTo[tokenConfig.mint.toBase58()] = tokenName;

    return mintTo;
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
