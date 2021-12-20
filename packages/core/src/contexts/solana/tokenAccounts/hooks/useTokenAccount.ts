import { useMemo } from 'react';

import type { PublicKey } from '@solana/web3.js';

import type { TokenAccount } from '../models';
import { useTokenAccounts } from './useTokenAccounts';

export const useTokenAccount = (
  publicKey: PublicKey | null | undefined,
): TokenAccount | null | undefined => {
  const publicKeys = useMemo(() => [publicKey], [publicKey]);
  const [tokenAccount] = useTokenAccounts(publicKeys);
  return tokenAccount;
};
