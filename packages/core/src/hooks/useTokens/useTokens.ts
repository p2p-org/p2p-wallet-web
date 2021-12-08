import { useMemo } from 'react';

import type { Token } from '@saberhq/token-utils';
import { networkToChainId } from '@saberhq/token-utils';

import { useConnectionContext } from '../../contexts/solana/solana';
import { makeTokenMap } from './utils/makeTokenMap';

export type TokenMap = { [address: string]: Token };

export const useTokens = (): {
  tokens: readonly Token[];
  tokenMap: TokenMap;
} => {
  const { network } = useConnectionContext();
  const chainId = networkToChainId(network);

  const standardTokenMap = useMemo(() => makeTokenMap(chainId), [network]);

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
