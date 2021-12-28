import { useMemo } from 'react';

import { useTokenAccount } from '@p2p-wallet-web/core';
import { usePubkey } from '@p2p-wallet-web/sail';
import type { PublicKey } from '@solana/web3.js';

import { useSettings } from 'app/contexts/general/settings';

export const useTokenAccountIsHidden = (_publicKey: PublicKey | string) => {
  const {
    settings: { isZeroBalancesHidden },
    tokenAccounts,
  } = useSettings();
  const publicKey = usePubkey(_publicKey);
  const tokenAccount = useTokenAccount(publicKey);

  return useMemo(() => {
    if (!publicKey) {
      return false;
    }

    if (!tokenAccount) {
      return false;
    }

    if (tokenAccounts.forceShowTokenAccounts.includes(publicKey.toBase58())) {
      return false;
    }

    if (isZeroBalancesHidden && tokenAccount.balance?.equalTo(0)) {
      return true;
    }

    return tokenAccounts.hiddenTokenAccounts.includes(publicKey.toBase58());
  }, [
    tokenAccounts.forceShowTokenAccounts,
    tokenAccounts.hiddenTokenAccounts,
    isZeroBalancesHidden,
    publicKey,
    tokenAccount,
  ]);
};
