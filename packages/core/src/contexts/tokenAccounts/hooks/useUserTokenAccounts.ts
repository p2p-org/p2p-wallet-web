import { useMemo } from 'react';

import { useTokenAccountsContext } from '../index';
import type { TokenAccount } from '../models';
import { useTokenAccounts } from './useTokenAccounts';

export const useUserTokenAccounts = (): readonly TokenAccount[] => {
  const { userTokenAccountKeys } = useTokenAccountsContext();
  const accountsData = useTokenAccounts(userTokenAccountKeys);

  // only loaded with account exists
  return useMemo(
    () => accountsData.filter((t): t is TokenAccount => Boolean(t) && Boolean(!t?.loading && t?.balance)),
    [accountsData],
  );
};
