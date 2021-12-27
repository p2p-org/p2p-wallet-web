import { useState } from 'react';

import { useWallet } from '@p2p-wallet-web/core';
import type { PublicKey } from '@solana/web3.js';
import { createContainer } from 'unstated-next';

import { useBlockchain } from 'app/contexts/solana/blockchain';

import { useConfig, useProgramIds } from '../config';
import type TokenAccount from '../models/TokenAccount';
import type { TokenConfigs } from '../orca-commons';
import type { AsyncResult, AsyncSuccess } from '../utils/AsyncCache';
import AsyncCache, { createAsyncSuccess, DEFAULT_MAX_AGE } from '../utils/AsyncCache';
import { loadTokenAccounts } from '../utils/tokenAccounts';

export type UserTokenAccountMap = {
  // If the account is for a standard token, pool token, or collectible,
  //   the key is the token symbol, e.g. ETH, USDC, ORCA, etc.
  // If the account is for a farm token, the key is the mint address.
  // This should be refactored so all keys are mint addresses.
  [key: string]: TokenAccount;
};

export type CacheValue = {
  standardTokenAccounts: AsyncSuccess<UserTokenAccountMap>;
};

const cache = new AsyncCache<CacheValue>();

function getCacheKey(publicKey: PublicKey) {
  return 'fetch' + publicKey.toBase58();
}

const NOT_CONNECTED_CACHE_KEY = 'notConnected';

export interface UseUser {
  useAsyncStandardTokenAccounts: (maxAge?: number) => AsyncResult<UserTokenAccountMap>;
  refreshStandardTokenAccounts(): Promise<UserTokenAccountMap | undefined>;
  accountHasNonATAs: boolean;
}

export const useUserInternal = (): UseUser => {
  const { slot, setSlot } = useBlockchain();
  const { connection, publicKey } = useWallet();
  const { tokenConfigs, mintToTokenName } = useConfig();
  const { token: tokenProgramId } = useProgramIds();
  const [accountHasNonATAs, setAccountHasNonATAs] = useState(false);

  function useAsyncUserTokenAccounts(maxAge: number) {
    let cacheKey, poll;

    if (publicKey) {
      cacheKey = getCacheKey(publicKey);
      poll = true;
    } else {
      cacheKey = NOT_CONNECTED_CACHE_KEY;
      poll = false;
    }

    return cache.useAsync(cacheKey, asyncTokenAccountsFn, maxAge, poll);
  }

  const asyncTokenAccountsFn = async (): Promise<CacheValue> => {
    if (!publicKey) {
      return {
        standardTokenAccounts: createAsyncSuccess({}),
      };
    }

    const { tokenAccounts, hasNonATAs } = await loadTokenAccounts(
      connection,
      slot,
      setSlot,
      publicKey,
      tokenProgramId,
      tokenConfigs['SOL'].mint,
      mintToTokenName,
    );

    setAccountHasNonATAs(hasNonATAs);

    function filterTokenAccountsByType(configs: TokenConfigs): UserTokenAccountMap {
      return Object.fromEntries(
        Object.entries(tokenAccounts).filter(([tokenName, _]) => configs.hasOwnProperty(tokenName)),
      );
    }

    const standardTokenAccounts = filterTokenAccountsByType(tokenConfigs);

    return {
      standardTokenAccounts: createAsyncSuccess(standardTokenAccounts),
    };
  };

  function useAsyncStandardTokenAccounts(maxAge = DEFAULT_MAX_AGE) {
    const asyncResult = useAsyncUserTokenAccounts(maxAge);

    if (!asyncResult.value) {
      return asyncResult;
    }

    return asyncResult.value.standardTokenAccounts;
  }

  async function refreshStandardTokenAccounts(): Promise<UserTokenAccountMap | undefined> {
    const cacheKey = publicKey ? getCacheKey(publicKey) : NOT_CONNECTED_CACHE_KEY;
    const result = await cache.refreshCache(cacheKey);

    return result?.standardTokenAccounts.value;
  }

  return {
    useAsyncStandardTokenAccounts,
    refreshStandardTokenAccounts,
    accountHasNonATAs,
  };
};

export const { Provider: UserProvider, useContainer: useUser } = createContainer(useUserInternal);
