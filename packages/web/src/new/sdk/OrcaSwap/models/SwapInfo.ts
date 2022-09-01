import type { ProgramIDS, TokenValue } from './OrcaInfo';
import type { Pools } from './Pools';
import type { Routes } from './Route';

export class SwapInfo {
  routes: Routes;
  tokens: Map<string, TokenValue>;
  pools: Pools;
  programIds: ProgramIDS;
  tokenNames: Map<string, string>; // [Mint: TokenName]

  constructor({
    routes,
    tokens,
    pools,
    programIds,
    tokenNames,
  }: {
    routes: Routes;
    tokens: Map<string, TokenValue>;
    pools: Pools;
    programIds: ProgramIDS;
    tokenNames: Map<string, string>;
  }) {
    this.routes = routes;
    this.tokens = tokens;
    this.pools = pools;
    this.programIds = programIds;
    this.tokenNames = tokenNames;
  }
}
