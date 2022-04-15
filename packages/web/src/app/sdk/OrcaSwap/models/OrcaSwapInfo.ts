import type { Pools } from './OrcaSwapPools';
import type { OrcaSwapProgramID } from './OrcaSwapProgramID';
import type { OrcaSwapRoutes } from './OrcaSwapRoute';
import type { OrcaSwapTokens } from './OrcaSwapToken';

export class OrcaSwapInfo {
  routes: OrcaSwapRoutes;
  tokens: OrcaSwapTokens;
  pools: Pools;
  programIds: OrcaSwapProgramID;
  tokenNames: Record<string, string>; // [Mint: TokenName]

  constructor({
    routes,
    tokens,
    pools,
    programIds,
    tokenNames,
  }: {
    routes: OrcaSwapRoutes;
    tokens: OrcaSwapTokens;
    pools: Pools;
    programIds: OrcaSwapProgramID;
    tokenNames: Record<string, string>; // [Mint: TokenName]
  }) {
    this.routes = routes;
    this.tokens = tokens;
    this.pools = pools;
    this.programIds = programIds;
    this.tokenNames = tokenNames;
  }
}
