import { useMemo } from 'react';

import { useAccountsData } from '@p2p-wallet-web/sail';
import { WRAPPED_SOL } from '@saberhq/token-utils';

import { useAllTokens } from '../../../../../hooks';
import { useConnectionContext } from '../../../solana';
import { useTokenAccountsContext } from '../../';
import type { TokenAccount } from '../../models';
import { parseTokenAccountsInternal } from './utils/parseTokenAccountsInternal';

export const useUserTokenAccounts = (): readonly TokenAccount[] => {
  const { tokenMap } = useAllTokens();
  const { userTokenAccountKeys } = useTokenAccountsContext();
  const { network } = useConnectionContext();
  const sol = WRAPPED_SOL[network];

  const accountsData = useAccountsData(userTokenAccountKeys);

  return useMemo(
    () =>
      parseTokenAccountsInternal({
        accountsData,
        tokenMap,
        userTokenAccountKeys,
        sol,
      }).filter((t): t is TokenAccount => t !== undefined),
    [accountsData, tokenMap, userTokenAccountKeys],
  );
};
