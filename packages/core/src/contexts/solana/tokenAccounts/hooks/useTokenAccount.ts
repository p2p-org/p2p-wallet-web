import { useMemo } from 'react';

import type { PublicKey } from '@solana/web3.js';

import type { TokenAccount } from '../models';
import { useTokenAccounts } from './useTokenAccounts';

export const useTokenAccount = (
  key: PublicKey | null | undefined,
): TokenAccount | null | undefined => {
  const theKey = useMemo(() => [key], [key]);
  const [tokenAccount] = useTokenAccounts(theKey);
  return tokenAccount;
};
