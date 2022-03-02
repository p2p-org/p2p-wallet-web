import { useMemo } from 'react';

import type { Token } from '@saberhq/token-utils';
import type { PublicKey } from '@solana/web3.js';

import { useTokens } from './useTokens';

/**
 * Uses and loads one token.
 * @param mint
 * @returns
 */
export const useToken = (mint?: PublicKey | null): Token | null | undefined => {
  const tokenMints = useMemo(() => [mint], [mint]);
  const [token] = useTokens(tokenMints);
  return token;
};
