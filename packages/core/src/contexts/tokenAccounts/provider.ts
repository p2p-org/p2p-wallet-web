import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSail } from '@p2p-wallet-web/sail';
import { useWallet } from '@saberhq/use-solana';
import type { PublicKey } from '@solana/web3.js';
import { uniqBy } from 'ramda';
import { createContainer } from 'unstated-next';

import { useConnectionContext } from '../solana';
import { precacheUserTokenAccounts } from './utils/precacheUserTokenAccounts';

export interface UseTokenAccounts {
  userTokenAccountKeys: PublicKey[];
  updateUserTokenAccountKeys: () => void;
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

  const updateUserTokenAccountKeys = useCallback(() => {
    if (!connection || !publicKey) {
      setUserTokenAccountKeys([]);
      return;
    }

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
  }, [accountsCache, connection, loader, publicKey]);

  useEffect(() => {
    if (!connection || !publicKey) {
      setUserTokenAccountKeys([]);
      return;
    }

    // First query of useAccountsData or useParsedAccountsData set data which will update only after new fetch
    // so we need to give userTokenAccountKeys to useUserTokenAccounts already with publicKey of user to instant show
    // this key in list
    setUserTokenAccountKeys((keys) => uniqBy((a) => a.toBase58(), [publicKey, ...keys]));

    updateUserTokenAccountKeys();
  }, [
    accountsCache,
    connection,
    loader,
    publicKey,
    setUserTokenAccountKeys,
    updateUserTokenAccountKeys,
  ]);

  return {
    userTokenAccountKeys,
    updateUserTokenAccountKeys,
  };
};

export const { Provider: TokenAccountsProvider, useContainer: useTokenAccountsContext } =
  createContainer(useTokenAccountsInternal);
