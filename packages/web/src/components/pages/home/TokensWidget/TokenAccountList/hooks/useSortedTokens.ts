import { useMemo } from 'react';

import type { TokenAccount } from '@p2p-wallet-web/core';

import { useMarketsData } from 'app/contexts';
import { sortByRules } from 'utils/tokens';

export const useSortedTokens = (tokenAccounts: TokenAccount[]): TokenAccount[] => {
  const symbols = useMemo(() => {
    return tokenAccounts.map((tokenAccount) => tokenAccount.balance?.token.symbol);
  }, [tokenAccounts]);
  const markets = useMarketsData(symbols);

  return useMemo(() => {
    if (!markets) {
      return tokenAccounts;
    }

    return tokenAccounts.sort(sortByRules(markets));
  }, [tokenAccounts, markets]);
};
