import { Cache } from 'new/sdk/Cache';

import type { Token } from '../Models';

export interface SolanaTokensRepositoryCache {
  getTokens(): Token[] | undefined;
  save(tokens: Token[]): void;
}

export class InMemoryTokensRepositoryCache implements SolanaTokensRepositoryCache {
  private _tokenCache = new Cache<string, Token[]>();
  private _tokenCacheKey = 'TokenRepositoryTokensKey';

  constructor() {}

  getTokens(): Token[] | undefined {
    return this._tokenCache.value(this._tokenCacheKey);
  }

  save(tokens: Token[]): void {
    this._tokenCache.insert(tokens, this._tokenCacheKey);
  }
}
