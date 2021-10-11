import { TokenInfo } from '@solana/spl-token-registry';

import { useTokenList } from './../provider';

export function useTokenMap(): Map<string, TokenInfo> {
  const { tokenMap } = useTokenList();
  return tokenMap;
}
