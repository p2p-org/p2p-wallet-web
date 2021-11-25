import { useEffect, useMemo, useState } from 'react';

import type { TokenInfo, TokenListContainer } from '@solana/spl-token-registry';
import { TokenListProvider } from '@solana/spl-token-registry';
import { createContainer } from 'unstated-next';

import { SOL_MINT } from '../../../constants';
import { useConnection } from '../connection';

const SOL_TOKEN_INFO = {
  chainId: 101,
  address: SOL_MINT.toString(),
  name: 'Native SOL',
  decimals: 9,
  symbol: 'SOL',
  logoURI: 'https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/solana/info/logo.png',
  tags: [],
  extensions: {
    website: 'https://solana.com/',
    serumV3Usdc: '9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT',
    serumV3Usdt: 'HWHvQhFmJB3NUcu1aihKmrKegfVxBEHzwVX6yZCKEsi1',
    coingeckoId: 'solana',
    waterfallbot: 'https://t.me/SOLwaterfall',
  },
};

export interface UseTokenMetas {
  tokenList?: TokenListContainer;
  tokenMetasMap: Map<string, TokenInfo>;
}

export interface UseTokenMetasArgs {}

const useTokenMetasInternal = (props: UseTokenMetasArgs): UseTokenMetas => {
  const { cluster } = useConnection();
  const [tokenList, setTokenList] = useState<TokenListContainer | undefined>();

  useEffect(() => {
    void new TokenListProvider().resolve().then(setTokenList);
  }, []);

  const tokens = useMemo(() => {
    if (!tokenList) {
      return [];
    }

    const _tokens = tokenList.filterByClusterSlug(cluster).getList();
    // Manually add a fake SOL mint for the native token. The component is
    // opinionated in that it distinguishes between wrapped SOL and SOL.
    _tokens.push(SOL_TOKEN_INFO);

    return _tokens;
  }, [tokenList, cluster]);

  // Token map for quick lookup.
  const tokenMetasMap = useMemo(() => {
    const _tokenMetasMap = new Map();

    tokens.forEach((tokenInfo: TokenInfo) => {
      _tokenMetasMap.set(tokenInfo.address, tokenInfo);
    });

    return _tokenMetasMap;
  }, [tokens]);

  return {
    tokenList,
    tokenMetasMap,
  };
};

export const { Provider: TokenMetasProvider, useContainer: useTokenMetas } = createContainer<
  UseTokenMetas,
  UseTokenMetasArgs
>(useTokenMetasInternal);
