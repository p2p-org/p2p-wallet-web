import { useMemo } from 'react';
import { useQueries } from 'react-query';

import { useTokens } from '@p2p-wallet-web/core';
import { zip } from 'ramda';

import type { Market, Markets } from 'app/contexts';
import { useConfig } from 'app/contexts';

import { marketLoader } from './marketLoader';

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const ONE_MINUTE = 1000 * 60;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const TEN_SECONDS = 1000 * 10;
// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const TEN_MINUTES = 1000 * 60 * 10;

export const useMarketsData = (symbols: (string | null | undefined)[]): Markets => {
  const { tokenConfigs } = useConfig();
  const mints = useMemo(
    () => symbols.map((symbol) => tokenConfigs[symbol]?.mint),
    [symbols, tokenConfigs],
  );

  const tokens = useTokens(mints);

  const coingeckoIds = useMemo(
    () => tokens.map((token) => token?.info.extensions?.coingeckoId),
    [tokens],
  );

  const markets = useQueries<Market[]>(
    coingeckoIds.map((coingeckoId) => ({
      queryKey: ['market', coingeckoId],
      queryFn: () => (coingeckoId ? marketLoader.load(coingeckoId) : null),
      suspense: true,
      refetchInterval: ONE_MINUTE,
      staleTime: TEN_SECONDS,
      cacheTime: TEN_MINUTES,
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
