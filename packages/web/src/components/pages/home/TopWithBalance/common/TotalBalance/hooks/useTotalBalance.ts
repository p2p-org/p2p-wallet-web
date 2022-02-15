import { useMemo } from 'react';

import { useUserTokenAccounts } from '@p2p-wallet-web/core';

import { useMarketsData } from 'app/contexts';

export const useTotalBalance = () => {
  const tokenAccounts = useUserTokenAccounts();

  const symbols = useMemo(() => {
    return tokenAccounts.map((tokenAccount) => tokenAccount.balance?.token.symbol);
  }, [tokenAccounts]);

  const markets = useMarketsData(symbols);

  const totalBalance = useMemo(
    () =>
      tokenAccounts.reduce((prev, tokenAccount) => {
        if (!tokenAccount?.balance?.token.symbol) {
          return prev;
        }

        const rate = markets[tokenAccount?.balance?.token.symbol];
        if (rate) {
          return tokenAccount.balance.asNumber * rate + prev;
        }

        // Same as USD
        return tokenAccount.balance.asNumber + prev;
      }, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokenAccounts, markets],
  );

  const isLoading = useMemo(() => {
    return tokenAccounts.some((tokenAccount) => tokenAccount.loading);
  }, [tokenAccounts]);

  return { totalBalance, isLoading };
};
