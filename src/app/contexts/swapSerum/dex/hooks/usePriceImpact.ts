import { useMemo } from 'react';

import { useRoute } from 'app/contexts/swapSerum/dex';

import { useSwap } from '../../swap';
import { useOrderbook } from './useOrderbook';

// TODO: handle edge case of insufficient liquidity
// inspired by https://github.com/project-serum/swap-ui/pull/90/files
export function usePriceImpact(): number {
  const { fromMint, toMint, toAmount } = useSwap();
  const route = useRoute(fromMint, toMint);
  // Use last route item to find impact
  const market = route ? route[route.length - 1] : undefined;

  const orderbook = useOrderbook(market);

  const priceImpact = useMemo(() => {
    if (!orderbook) {
      return 0;
    }

    const orders = toMint.equals(orderbook.bids.market.baseMintAddress)
      ? orderbook.asks.items(false)
      : orderbook.bids.items(true);

    let remainingAmount = toAmount;
    let order = orders.next();

    console.log(order);
    const initialPrice = order.value.price;
    let priceAfterOrder = initialPrice;

    while (!order.done && remainingAmount > 0) {
      priceAfterOrder = order.value.price;

      if (remainingAmount > order.value.size) {
        remainingAmount = remainingAmount - order.value.size;
      } else {
        remainingAmount = 0;
      }

      order = orders.next();
    }

    const priceChange = Math.abs(initialPrice - priceAfterOrder);
    const priceImpact = (priceChange * 100) / initialPrice;
    return priceImpact;
  }, [orderbook, toAmount, toMint]);

  return priceImpact;
}
