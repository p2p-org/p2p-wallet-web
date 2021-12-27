import { useEffect, useMemo, useState } from 'react';

import { useSail } from '@p2p-wallet-web/sail';
import { useWallet } from '@saberhq/use-solana';
import type { PublicKey } from '@solana/web3.js';
import { uniqBy } from 'ramda';
import { createContainer } from 'unstated-next';

import { useConnectionContext } from '../solana';
import { precacheUserTokenAccounts } from './utils/precacheUserTokenAccounts';

export interface UseTokenAccounts {
  userTokenAccountKeys: PublicKey[];
}

const useTokenAccountsInternal = (): UseTokenAccounts => {
  const { connection } = useConnectionContext();
  const {
    accounts: { loader, accountsCache },
  } = useSail();
  const { publicKey } = useWallet();

  // Initial userTokenAccountKeys
  const theKey = useMemo(() => (publicKey ? [publicKey] : []), [publicKey?.toBase58()]);
  const [userTokenAccountKeys, setUserTokenAccountKeys] = useState<PublicKey[]>(theKey);

  useEffect(() => {
    if (!connection || !publicKey) {
      setUserTokenAccountKeys([]);
      return;
    }

    // First query of useAccountsData or useParsedAccountsData set data which will update only after new fetch
    // so we need to give userTokenAccountKeys to useUserTokenAccounts already with publicKey of user to instant show
    // this key in list
    setUserTokenAccountKeys((keys) => uniqBy((a) => a.toBase58(), [publicKey, ...keys]));

    const controller = new AbortController();
    void precacheUserTokenAccounts(connection, loader, accountsCache, publicKey).then(
      ({ keys, ownerPublicKey }) => {
        // if user wallet publicKey already changed - ignore
        if (!ownerPublicKey.equals(publicKey)) {
          return;
        }

        if (keys) {
          setUserTokenAccountKeys((prevKeys) =>
            uniqBy((a) => a.toBase58(), [publicKey, ...prevKeys, ...keys]),
          );
        }
      },
    );

    return () => {
      controller.abort();
    };
  }, [accountsCache, connection, loader, publicKey, setUserTokenAccountKeys]);

  return {
    userTokenAccountKeys,
  };
};

export const { Provider: TokenAccountsProvider, useContainer: useTokenAccountsContext } =
  createContainer(useTokenAccountsInternal);
