import type { PublicKey } from '@solana/web3.js';

import type { TokenAccount } from '../models/TokenAccount';
import { useTokenAccounts } from './../';

export const useTokenAccount = (pubkey: PublicKey): TokenAccount | null => {
  const { tokenAccountsMap } = useTokenAccounts();

  const tokenAccount = tokenAccountsMap.get(pubkey.toBase58());

  if (!tokenAccount) {
    return null;
  }

  return tokenAccount;
};
