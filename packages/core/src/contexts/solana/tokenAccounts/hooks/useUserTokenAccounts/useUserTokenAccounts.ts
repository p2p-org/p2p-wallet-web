import { useMemo } from 'react';

import { useAccountsData } from '@p2p-wallet-web/sail';
import { WRAPPED_SOL } from '@saberhq/token-utils';

import { useTokens } from '../../../../../hooks';
import { useConnectedWallet, useConnectionContext } from '../../../solana';
import { useTokenAccounts } from '../../';
import type { TokenAccount } from '../../models';
import { parseTokenAccountsInternal } from './utils/parseTokenAccountsInternal';

export const useUserTokenAccounts = (): readonly TokenAccount[] => {
  const { tokenMap } = useTokens();
  const { userTokenAccountKeys } = useTokenAccounts();
  const wallet = useConnectedWallet();
  const { network } = useConnectionContext();
  const nativePublicKey = wallet?.publicKey;
  const sol = WRAPPED_SOL[network];

  const accountsData = useAccountsData(userTokenAccountKeys);

  return useMemo(
    () =>
      parseTokenAccountsInternal({
        accountsData,
        tokenMap,
        userTokenAccountKeys,
        sol,
        nativePublicKey,
      }).filter((t): t is TokenAccount => t !== undefined),
    [accountsData, nativePublicKey, tokenMap, userTokenAccountKeys],
  );
};
