import { useEffect, useState } from 'react';

import type { Provider } from '@project-serum/anchor';
import { BN } from '@project-serum/anchor';
import { createContainer } from 'unstated-next';

import { SOL_MINT } from '../common/constants';
import { _OWNED_TOKEN_ACCOUNTS_CACHE } from './common/cache';
import { getOwnedAssociatedTokenAccounts } from './utils/getOwnedAssociatedTokenAccounts';

export interface UseToken {
  provider: Provider;
}

export interface UseTokenArgs {
  provider: Provider;
}

const useTokenInternal = (props: UseTokenArgs): UseToken => {
  const provider = props.provider;
  const [, setRefresh] = useState(0);

  // Fetch all the owned token accounts for the wallet.
  useEffect(() => {
    if (!provider.wallet.publicKey) {
      _OWNED_TOKEN_ACCOUNTS_CACHE.length = 0;
      setRefresh((r) => r + 1);
      return;
    }
    // Fetch SPL tokens.
    getOwnedAssociatedTokenAccounts(provider.connection, provider.wallet.publicKey).then((accs) => {
      if (accs) {
        // @ts-ignore
        _OWNED_TOKEN_ACCOUNTS_CACHE.push(...accs);
        setRefresh((r) => r + 1);
      }
    });
    // Fetch SOL balance.
    provider.connection.getAccountInfo(provider.wallet.publicKey).then((acc) => {
      if (acc) {
        _OWNED_TOKEN_ACCOUNTS_CACHE.push({
          publicKey: provider.wallet.publicKey,
          // @ts-ignore
          account: {
            amount: new BN(acc.lamports),
            mint: SOL_MINT,
          },
        });
        setRefresh((r) => r + 1);
      }
    });
  }, [provider.wallet.publicKey, provider.connection]);

  return {
    provider,
  };
};

export const { Provider: TokenProvider, useContainer: useToken } =
  createContainer(useTokenInternal);
