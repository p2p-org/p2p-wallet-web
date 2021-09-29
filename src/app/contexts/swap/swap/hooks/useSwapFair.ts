import { PublicKey } from '@solana/web3.js';

import { useFairRoute } from '../../dex/hooks/useFairRoute';
import { useSwap } from '../provider';

export function _useSwapFair(
  fromMint: PublicKey,
  toMint: PublicKey,
  fairOverride: number | null,
): number | undefined {
  const fairRoute = useFairRoute(fromMint, toMint);
  const fair = fairOverride === null ? fairRoute : fairOverride;
  return fair;
}

export function useSwapFair(): number | undefined {
  const { fairOverride, fromMint, toMint } = useSwap();
  return _useSwapFair(fromMint, toMint, fairOverride);
}
