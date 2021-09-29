import { PublicKey } from '@solana/web3.js';

import { useOrderbook } from './useOrderbook';

type Bbo = {
  bestBid?: number;
  bestOffer?: number;
  mid?: number;
};

// Fair price for a given market, as defined by the mid.
export function useBbo(market?: PublicKey): Bbo | undefined {
  const orderbook = useOrderbook(market);

  if (orderbook === undefined) {
    return undefined;
  }

  const bestBid = orderbook.bids.items(true).next().value;
  const bestOffer = orderbook.asks.items(false).next().value;

  if (!bestBid && !bestOffer) {
    return {};
  }

  if (!bestBid) {
    return { bestOffer: bestOffer.price };
  }

  if (!bestOffer) {
    return { bestBid: bestBid.price };
  }

  const mid = (bestBid.price + bestOffer.price) / 2.0;

  return { bestBid: bestBid.price, bestOffer: bestOffer.price, mid };
}
