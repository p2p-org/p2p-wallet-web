import { useMemo } from 'react';

import type { TokenAccount } from '@p2p-wallet-web/core';
import { useUserTokenAccounts } from '@p2p-wallet-web/core';
import { NATIVE_MINT } from '@solana/spl-token';

import { useSettings } from 'app/contexts/settings';

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
      const isHidden = tokenAccounts.hiddenTokenAccounts.includes(tokenAccount.key.toBase58());

      if (isHidden) {
        onlyHiddenTokenAccounts.push(tokenAccount);

        continue;
      }

      const isZero = !tokenAccount.balance || tokenAccount.balance.equalTo(0);
      const notForceShow = !tokenAccounts.forceShowTokenAccounts.includes(
        tokenAccount.key.toBase58(),
      );
      const notSOL = tokenAccount.mint && !tokenAccount.mint.equals(NATIVE_MINT);

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
