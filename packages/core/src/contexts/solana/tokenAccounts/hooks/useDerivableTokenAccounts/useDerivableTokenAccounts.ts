import { useCallback, useMemo } from 'react';

import type { AccountParser } from '@p2p-wallet-web/sail';
import { useParsedAccountsData } from '@p2p-wallet-web/sail';
import { TokenAmount, WRAPPED_SOL } from '@saberhq/token-utils';
import { useConnectionContext } from '@saberhq/use-solana';
import { PublicKey } from '@solana/web3.js';

import type { DERIVATION_PATH } from '../../../../../constants/common';
import type { ValueOf } from '../../../../../types/utility-types';
import { derivePublicKeyFromSeed } from '../../../seed';
import type { TokenAccount } from '../../models';
import { parseTokenAccountsInternal } from './utils/parseTokenAccountsInternal';

export const useDerivableTokenAccounts = (
  seed: string,
  derivationPath: ValueOf<typeof DERIVATION_PATH>,
): readonly TokenAccount[] => {
  const { network } = useConnectionContext();
  const sol = WRAPPED_SOL[network];
  const parser: AccountParser<TokenAmount> = useCallback(
    (data) => {
      return new TokenAmount(sol, data.accountInfo.lamports);
    },
    [sol],
  );

  const derivableTokenAccountKeys = useMemo(() => {
    return new Array(5)
      .fill(null)
      .map((_, idx) => new PublicKey(derivePublicKeyFromSeed(seed, idx, derivationPath)));
  }, [derivationPath, seed]);

  const accountsData = useParsedAccountsData(derivableTokenAccountKeys, parser);

  return useMemo(
    () =>
      parseTokenAccountsInternal({
        accountsData,
        sol,
        derivableTokenAccountKeys,
      }).filter((t): t is TokenAccount => t !== undefined),
    [accountsData, derivableTokenAccountKeys, sol],
  );
};
