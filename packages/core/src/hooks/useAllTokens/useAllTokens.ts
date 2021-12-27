import { useMemo } from 'react';

import type { Token } from '@saberhq/token-utils';
import { networkToChainId } from '@saberhq/token-utils';

import { useConnectionContext } from '../../contexts/solana';
import { makeTokenMap } from './utils/makeTokenMap';

export type TokenMap = Record<string, Token>;

export const useAllTokens = (): {
  tokens: readonly Token[];
  tokenMap: TokenMap;
} => {
  const { network } = useConnectionContext();
  const chainId = networkToChainId(network);

  const standardTokenMap = useMemo(() => makeTokenMap(chainId), [chainId]);

  const tokenMap = useMemo(() => {
    if (!chainId) {
      return {};
    }

    return standardTokenMap;
  }, [chainId, standardTokenMap]);

  const tokens = useMemo(() => Object.values(tokenMap), [tokenMap]);

  return {
    tokens,
    tokenMap,
  };
};
