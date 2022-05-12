import { useMemo } from 'react';
import { useQueries } from 'react-query';

import { useTokensContext } from '@p2p-wallet-web/core';
import { zip } from 'ramda';

import type { Market, Markets } from 'app/contexts';

import { marketLoader } from './marketLoader';

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const THIRTY_SECONDS = 1000 * 30;

export const useMarketsData = (symbols: (string | null | undefined)[]): Markets => {
  const { tokenNameMap } = useTokensContext();

  const coingeckoIds = useMemo(
    () =>
      symbols.map((symbol) => {
        const symbolUpper = symbol?.toUpperCase();
        if (symbolUpper === 'SOL') {
          return 'solana';
        } else {
          return tokenNameMap[symbolUpper]?.info.extensions?.coingeckoId;
        }
      }),
    [symbols, tokenNameMap],
  );

  const markets = useQueries<Market[]>(
    coingeckoIds.map((coingeckoId) => ({
      queryKey: ['market', coingeckoId],
      queryFn: () => (coingeckoId ? marketLoader.load(coingeckoId) : null),
      suspense: true,
      refetchInterval: THIRTY_SECONDS,
    })),
  );

  return useMemo(() => {
    return zip(symbols, markets).reduce((acc, [symbol, market]) => {
      if (symbol) {
        acc[symbol.toUpperCase()] = market.data ?? null;
      }

      return acc;
    }, <Markets>{});
  }, [symbols, markets]);
};
