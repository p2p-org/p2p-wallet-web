import { useMemo, useState } from 'react';
import { useDebounce } from 'react-use';

import { createContainer } from 'unstated-next';

import { useIncrementingNonce } from '../../../shared/hooks/useIncrementingNonce';
import { withTimeout } from '../../../shared/utils/promise';
import { useConnection } from '../connection';
import { useWallet } from '../wallet';
import type { TokenAccount } from './models/TokenAccount';
import { getNativeTokenBalanceAsync } from './utils/getNativeTokenBalanceAsync';
import { getTokenAccountInfoAsync } from './utils/getTokenAccountInfoAsync';

export interface UseTokenAccounts {
  solanaBalance?: number;
  tokenAccounts?: TokenAccount[];
  tokenAccountsMap: Map<string, TokenAccount>;
  refreshBalances: (_isRefreshingBalances: boolean) => void;
  isRefreshingBalances: boolean;
}

export interface UseTokenAccountsArgs {}

const useTokenAccountsInternal = (props: UseTokenAccountsArgs): UseTokenAccounts => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();

  const [isRefreshingBalances, setIsRefreshingBalances] = useState(false);
  const [solanaBalance, setSolanaBalance] = useState<number>();
  const [tokenAccounts, setTokenAccounts] = useState<TokenAccount[]>();
  const [increment, setIncrement] = useIncrementingNonce(10000);

  const refreshBalances = async (_isRefreshingBalances = false) => {
    if (!publicKey) {
      return;
    }

    setIsRefreshingBalances(_isRefreshingBalances);

    try {
      const [_solanaBalance, _tokenAccounts] = await withTimeout(
        Promise.all([
          getNativeTokenBalanceAsync(publicKey, connection),
          getTokenAccountInfoAsync(publicKey, connection),
        ]),
        5000,
      );

      setSolanaBalance(_solanaBalance);
      setTokenAccounts(_tokenAccounts);
    } catch (err) {
      console.error(err);
      // void 0 === te && C();
    } finally {
      setIsRefreshingBalances(false);
    }
  };

  useDebounce(
    () => {
      void refreshBalances(true);
    },
    200,
    [increment],
  );

  // Token Account map for quick lookup.
  const tokenAccountsMap = useMemo(() => {
    const _tokenAccountsMap = new Map();

    // add native balance

    if (tokenAccounts) {
      tokenAccounts.forEach((tokenAccount) => {
        _tokenAccountsMap.set(tokenAccount.pubkey.toBase58(), tokenAccount);
      });
    }

    return _tokenAccountsMap;
  }, [tokenAccounts]);

  // console.log(111, solanaBalance, objectArrayToMap(tokenAccounts || [], 'mintAddress'));
  // console.log(111, solanaBalance, tokenAccounts);

  return {
    solanaBalance,
    tokenAccounts,
    tokenAccountsMap,
    refreshBalances,
    isRefreshingBalances,
  };
};

export const { Provider: TokenAccountsProvider, useContainer: useTokenAccounts } =
  createContainer(useTokenAccountsInternal);
