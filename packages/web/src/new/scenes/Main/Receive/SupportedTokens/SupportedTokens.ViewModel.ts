import { action, flow, makeObservable, observable } from 'mobx';
import { singleton } from 'tsyringe';

import { SDListViewModel } from 'new/core/viewmodels/SDListViewModel';
import type { Token } from 'new/sdk/SolanaSDK';
import { excludingSpecialTokens } from 'new/sdk/SolanaSDK';
import { TokensRepository } from 'new/services/Repositories';

@singleton()
export class SupportedTokensViewModel extends SDListViewModel<Token> {
  keyword = '';

  constructor(private _tokensRepository: TokensRepository) {
    super();

    makeObservable(this, {
      keyword: observable,

      search: action,
    });
  }

  protected override setDefaults() {
    this.keyword = '';
  }

  protected override onInitialize() {
    this.reload();
  }

  protected override afterReactionsRemoved() {
    this.requestDisposable?.cancel();
    this.data = [];
  }

  override createRequest = flow<Token[], []>(function* (
    this: SupportedTokensViewModel,
  ): Generator<Promise<Token[]>> {
    const existingSymbols = new Set<string>();

    return yield this._tokensRepository
      .getTokensList()
      .then((tokens) => excludingSpecialTokens(tokens))
      .then((tokens) =>
        tokens.filter((token) => {
          const include = !existingSymbols.has(token.symbol);
          if (include) {
            existingSymbols.add(token.symbol);
          }
          return include;
        }),
      );
  });

  override map(newData: Token[]): Token[] {
    let data = super.map(newData).sort((firstToken, secondToken) => {
      const firstTokenPriority = getTokenPriority(firstToken);
      const secondTokenPriority = getTokenPriority(secondToken);

      if (firstTokenPriority === secondTokenPriority) {
        return firstToken.name < secondToken.name
          ? -1
          : firstToken.name === secondToken.name
          ? 0
          : 1;
      } else {
        return firstTokenPriority > secondTokenPriority
          ? -1
          : firstTokenPriority === secondTokenPriority
          ? 0
          : 1;
      }
    });

    const keyword = this.keyword;
    if (keyword) {
      data = data.filter((wallet) => hasKeyword(wallet, keyword));
    }
    return data;
  }

  search(keyword: string): void {
    if (this.keyword === keyword) {
      return;
    }
    this.keyword = keyword;
    this.reload();
  }
}

const getTokenPriority = (token: Token): number => {
  switch (token.symbol) {
    case 'SOL':
      return Number.MAX_SAFE_INTEGER;
    case 'USDC':
      return Number.MAX_SAFE_INTEGER - 1;
    case 'BTC':
      return Number.MAX_SAFE_INTEGER - 2;
    case 'USDT':
      return Number.MAX_SAFE_INTEGER - 3;
    case 'ETH':
      return Number.MAX_SAFE_INTEGER - 4;
    default:
      return 0;
  }
};

const hasKeyword = (token: Token, keyword: string): boolean => {
  return (
    token.symbol.toLowerCase().includes(keyword.toLowerCase()) ||
    token.name.toLowerCase().includes(keyword.toLowerCase())
  );
};
