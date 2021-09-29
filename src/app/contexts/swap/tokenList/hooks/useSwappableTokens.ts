import { useTokenList } from '../provider';

export function useSwappableTokens() {
  const { swappableTokens, swappableTokensWormhole, swappableTokensSollet } = useTokenList();
  return { swappableTokens, swappableTokensWormhole, swappableTokensSollet };
}
