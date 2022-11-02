import type { APIEndpoint } from '../Models';
import { Token } from '../Models';
import type { SolanaTokensRepository } from './SolanaTokensRepository';
import { TokensListParser } from './TokensListParser';
import type { SolanaTokensRepositoryCache } from './TokensRepositoryCache';
import { InMemoryTokensRepositoryCache } from './TokensRepositoryCache';

export class TokensRepository implements SolanaTokensRepository {
  private _cache: SolanaTokensRepositoryCache;

  private _tokenListParser: TokensListParser;
  private _endpoint: APIEndpoint;

  constructor({
    endpoint,
    tokenListParser = new TokensListParser(),
    cache = new InMemoryTokensRepositoryCache(),
  }: {
    endpoint: APIEndpoint;
    tokenListParser?: TokensListParser;
    cache?: SolanaTokensRepositoryCache;
  }) {
    this._endpoint = endpoint;
    this._tokenListParser = tokenListParser;
    this._cache = cache;
  }

  // MARK: - Public Methods

  /// Returns all tokens
  /// - Parameters:
  ///  - useCache: wether to use cached value or not, default - true
  /// - Throws: TokenRepositoryError
  /// - Returns Set of tokens
  ///
  async getTokensList(useCache = true): Promise<Token[]> {
    if (useCache) {
      const tokens = this._cache.getTokens();
      if (tokens) {
        return tokens;
      }
    }
    const tokenList = await this._tokenListParser.parse(this._endpoint.network);
    this._cache.save(tokenList);
    return tokenList;
  }

  async getTokenWithMint(mint?: string): Promise<Token> {
    if (!mint) {
      return Token.unsupported({});
    }

    const tokens = await this.getTokensList();

    // Special case, we need take SOL not wSOL from repository.
    if (mint === 'So11111111111111111111111111111111111111112') {
      return (
        tokens.find((t) => t.address === mint && t.symbol === 'SOL') ?? Token.unsupported({ mint })
      );
    } else {
      return tokens.find((t) => t.address === mint) ?? Token.unsupported({ mint });
    }
  }
}
