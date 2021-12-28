import type { PoolConfigs, TokenConfigs } from '../orca-commons';
import { getTradeId, orderTokenPair } from '../utils/pools';
import type { Route, RouteConfigs } from './provider';

function getPairs(tokens: string[]): string[][] {
  const pairs: string[][] = [];

  for (let i = 0; i + 1 < tokens.length; i++) {
    for (let j = i + 1; j < tokens.length; j++) {
      const tokenA = tokens[i];
      const tokenB = tokens[j];

      pairs.push(orderTokenPair(tokenA, tokenB));
    }
  }

  return pairs;
}

function getAllRoutes(pairs: string[][], poolConfigs: PoolConfigs): RouteConfigs {
  const allRoutes: RouteConfigs = {};
  pairs.forEach(([tokenA, tokenB]) => {
    allRoutes[getTradeId(tokenA, tokenB)] = getRoutes(tokenA, tokenB, poolConfigs);
  });

  return allRoutes;
}

function getRoutes(tokenA: string, tokenB: string, poolConfigs: PoolConfigs): Route[] {
  const routes: Route[] = [];

  // Find all pools that contain the same tokens.
  // Checking tokenAName and tokenBName will find Stable pools.
  Object.entries(poolConfigs).forEach(([poolId, poolConfig]) => {
    if (
      (poolConfig.tokenAName === tokenA && poolConfig.tokenBName === tokenB) ||
      (poolConfig.tokenAName === tokenB && poolConfig.tokenBName === tokenA)
    ) {
      routes.push([poolId]);
    }
  });

  // Find all pools that contain the first token but not the second
  const firstLegPools = Object.entries(poolConfigs)
    .filter(
      ([, poolConfig]) =>
        (poolConfig.tokenAName === tokenA && poolConfig.tokenBName !== tokenB) ||
        (poolConfig.tokenBName === tokenA && poolConfig.tokenAName !== tokenB),
    )
    .map(([poolId, poolConfig]) => [
      poolId,
      poolConfig.tokenBName === tokenA ? poolConfig.tokenAName : poolConfig.tokenBName,
    ]);

  // Find all routes that can include firstLegPool and a second pool.
  firstLegPools.forEach(([firstLegPoolId, intermediateTokenName]) => {
    Object.entries(poolConfigs).forEach(([secondLegPoolId, poolConfig]) => {
      if (
        (poolConfig.tokenAName === intermediateTokenName && poolConfig.tokenBName === tokenB) ||
        (poolConfig.tokenBName === intermediateTokenName && poolConfig.tokenAName === tokenB)
      ) {
        routes.push([firstLegPoolId, secondLegPoolId]);
      }
    });
  });

  return routes;
}

export function generateRoutes(tokenConfigs: TokenConfigs, poolConfigs: PoolConfigs): RouteConfigs {
  const tokens = Object.entries(tokenConfigs)
    .filter(([, tokenConfigs]) => !tokenConfigs.poolToken)
    .map(([tokenName]) => tokenName);

  const pairs = getPairs(tokens);

  return getAllRoutes(pairs, poolConfigs);
}
