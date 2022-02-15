import { useMemo } from 'react';
import { useQueries } from 'react-query';

import { zip } from 'ramda';

import type { Market, Markets } from 'app/contexts';

import { marketLoader } from './marketLoader';

export const useMarketsData = (keys: (string | null | undefined)[]): Markets => {
  const markets = useQueries<Market[]>(
    keys.map((key) => ({
      queryKey: ['market', key?.toUpperCase()],
      queryFn: () => (key ? marketLoader.load(key.toUpperCase()) : null),
      suspense: true,
    })),
  );

  return useMemo(() => {
    return zip(keys, markets).reduce((acc, [key, market]) => {
      if (key) {
        acc[key.toUpperCase()] = market.data ?? null;
      }

      return acc;
    }, <Markets>{});
  }, [keys, markets]);
};
