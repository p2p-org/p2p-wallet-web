import { useMemo } from 'react';

import { usePubkey } from '@p2p-wallet-web/sail';
import type { PublicKey } from '@solana/web3.js';

import type { TokenAccount } from '../models';
import { useUserTokenAccounts } from './useUserTokenAccounts';

export const useUserTokenAccount = (
  _publicKey: PublicKey | string | null | undefined,
): TokenAccount | undefined => {
  const publicKey = usePubkey(_publicKey);
  const tokenAccounts = useUserTokenAccounts();

  return useMemo(() => {
    if (!publicKey) {
      return undefined;
    }

    return tokenAccounts.find((tokenAccount) => tokenAccount.key.equals(publicKey));
  }, [tokenAccounts, publicKey]);
};
