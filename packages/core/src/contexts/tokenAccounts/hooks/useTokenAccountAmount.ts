import { useMemo } from 'react';

import { TokenAmount } from '@saberhq/token-utils';
import type { PublicKey } from '@solana/web3.js';

import { useTokenAccount } from './index';

export const useTokenAccountAmount = (
  publicKey: PublicKey | null | undefined,
  value: string | undefined,
): { loading: boolean; balance: TokenAmount | undefined } | undefined => {
  const tokenAccount = useTokenAccount(publicKey);

  return useMemo(() => {
    if (!value) {
      return {
        loading: false,
        balance: undefined,
      };
    }

    if (!tokenAccount?.balance?.token) {
      return {
        loading: !!tokenAccount?.loading,
        balance: undefined,
      };
    }

    try {
      return {
        loading: !!tokenAccount?.loading,
        balance: new TokenAmount(tokenAccount.balance.token, value),
      };
    } catch (e) {
      console.warn('Error parsing token amount', e);
      return undefined;
    }
  }, [tokenAccount, value]);
};
