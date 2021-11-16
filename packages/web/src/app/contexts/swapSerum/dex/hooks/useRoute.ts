import type { PublicKey } from '@solana/web3.js';

import { useRouteVerbose } from './useRouteVerbose';

export function useRoute(fromMint: PublicKey, toMint: PublicKey): Array<PublicKey> | null {
  const route = useRouteVerbose(fromMint, toMint);

  if (route === null) {
    return null;
  }

  return route.markets;
}
