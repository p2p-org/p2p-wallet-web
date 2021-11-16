import type { PublicKey } from '@solana/web3.js';

import { SOL_MINT, WRAPPED_SOL_MINT } from '../../common/constants';
import { useBbo } from './useBbo';
import { useMarket } from './useMarket';
import { useRoute } from './useRoute';

// Fair price for a theoretical toMint/fromMint market. I.e., the number
// of `fromMint` tokens to purchase a single `toMint` token. Aggregates
// across a trade route, if needed.
export function useFairRoute(fromMint: PublicKey, toMint: PublicKey): number | undefined {
  const route = useRoute(fromMint, toMint);
  const fromBbo = useBbo(route ? route[0] : undefined);
  const fromMarket = useMarket(route ? route[0] : undefined);
  const toBbo = useBbo(route ? route[1] : undefined);

  if (route === null) {
    return undefined;
  }

  if (route.length === 1 && fromBbo !== undefined) {
    if (fromMarket === undefined) {
      return undefined;
    }

    if (
      fromMarket?.baseMintAddress.equals(fromMint) ||
      (fromMarket?.baseMintAddress.equals(WRAPPED_SOL_MINT) && fromMint.equals(SOL_MINT))
    ) {
      return fromBbo.bestBid && 1.0 / fromBbo.bestBid;
    } else {
      return fromBbo.bestOffer && fromBbo.bestOffer;
    }
  }

  if (
    fromBbo === undefined ||
    fromBbo.bestBid === undefined ||
    toBbo === undefined ||
    toBbo.bestOffer === undefined
  ) {
    return undefined;
  }

  return toBbo.bestOffer / fromBbo.bestBid;
}
