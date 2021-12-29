import { useMemo } from 'react';

import type { TokenAccount } from '@p2p-wallet-web/core';
import { useUserTokenAccounts } from '@p2p-wallet-web/core';

import { useSettings } from 'app/contexts/general/settings';

export const useTokenAccountsHidden = (): [TokenAccount[], TokenAccount[]] => {
  const userTokenAccounts = useUserTokenAccounts();
  const {
    settings: { isZeroBalancesHidden },
    tokenAccounts,
  } = useSettings();

  return useMemo(() => {
    const onlyTokenAccounts: TokenAccount[] = [];
    const onlyHiddenTokenAccounts: TokenAccount[] = [];

    for (const tokenAccount of userTokenAccounts) {
      const isHidden = tokenAccount.key
        ? tokenAccounts.hiddenTokenAccounts.includes(tokenAccount.key.toBase58())
        : false;

      if (isHidden) {
        onlyHiddenTokenAccounts.push(tokenAccount);

        continue;
      }

      const isZero = !tokenAccount.balance || tokenAccount.balance.equalTo(0);
      const notForceShow = tokenAccount.key
        ? !tokenAccounts.forceShowTokenAccounts.includes(tokenAccount.key.toBase58())
        : false;
      const notSOL = !tokenAccount.balance?.token.isRawSOL;

      if (isZeroBalancesHidden && isZero && notForceShow && notSOL) {
        onlyHiddenTokenAccounts.push(tokenAccount);

        continue;
      }

      onlyTokenAccounts.push(tokenAccount);
    }

    return [onlyTokenAccounts, onlyHiddenTokenAccounts];
  }, [
    userTokenAccounts,
    isZeroBalancesHidden,
    tokenAccounts.forceShowTokenAccounts,
    tokenAccounts.hiddenTokenAccounts,
  ]);
};
