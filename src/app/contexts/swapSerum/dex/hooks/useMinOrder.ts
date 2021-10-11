import { useMemo } from 'react';

import { PublicKey } from '@solana/web3.js';

import { useSwap } from 'app/contexts/swapSerum';
import { useFairRoute, useMarket, useRouteVerbose } from 'app/contexts/swapSerum/dex';
import { useSwapFair } from 'app/contexts/swapSerum/swap';
import { useMint } from 'app/contexts/swapSerum/token';

export const useMinOrder = () => {
  const { fromMint, toMint, fromAmount } = useSwap();
  const fromMintInfo = useMint(fromMint);
  const route = useRouteVerbose(fromMint, toMint);
  const fromMarket = useMarket(route && route.markets ? route.markets[0] : undefined);
  const toMarket = useMarket(route && route.markets ? route.markets[1] : undefined);

  const fair = useSwapFair();
  const quoteMint = (fromMarket && fromMarket.quoteMintAddress) as PublicKey;

  const quoteExchangeRate = useFairRoute(fromMint, quoteMint) || 0;
  const toExchangeRate = useFairRoute(toMint, quoteMint) || 0;

  return useMemo(() => {
    // inspired by https://github.com/project-serum/swap-ui/pull/91/files

    const isMultiRoute = (route?.markets?.length || 0) > 1;

    const fromMinOrderSize = fromMarket?.minOrderSize || 0;
    const toMinOrderSize = toMarket?.minOrderSize || 0;

    let isMinOrderSize: boolean = false;
    let minOrderSize: number = 0;

    if (!fair) {
      return { isMinOrderSize, minOrderSize };
    }

    if (isMultiRoute) {
      if (quoteExchangeRate > 1 && toExchangeRate > 1) {
        const toEffectiveAmount = fromAmount * (1 / fair);
        minOrderSize =
          fromMinOrderSize > toEffectiveAmount ? fromMinOrderSize : toMinOrderSize / (1 / fair);
        isMinOrderSize = fromAmount >= fromMinOrderSize && toEffectiveAmount >= toMinOrderSize;
      } else {
        const quoteEffectiveAmount = fromAmount * (1 / quoteExchangeRate);
        minOrderSize =
          (toMinOrderSize * quoteExchangeRate) / toExchangeRate > fromMinOrderSize
            ? (toMinOrderSize * quoteExchangeRate) / toExchangeRate
            : fromMinOrderSize;
        isMinOrderSize =
          fromAmount >= fromMinOrderSize && quoteEffectiveAmount * toExchangeRate >= toMinOrderSize;
      }
    } else {
      let baseMint = fromMarket?.decoded.baseMint || null;
      if (baseMint?.toString() === fromMint.toString()) {
        minOrderSize = fromMinOrderSize;
        isMinOrderSize = fromAmount >= fromMinOrderSize;
      } else {
        if (fair < 1) {
          minOrderSize = fromMinOrderSize;
          isMinOrderSize = fromAmount * (1 / fair) >= fromMinOrderSize;
        } else {
          minOrderSize = fromMinOrderSize * fair;
          isMinOrderSize = fromAmount >= fromMinOrderSize * fair;
        }
      }
    }

    const decimalPow = fromMintInfo ? 10 ** fromMintInfo.decimals : 1;

    return {
      minOrderSize: Math.round(minOrderSize * decimalPow) / decimalPow,
      isMinOrderSize,
    };
  }, [
    fair,
    fromAmount,
    fromMarket?.decoded.baseMint,
    fromMarket?.minOrderSize,
    fromMint,
    fromMintInfo,
    quoteExchangeRate,
    route?.markets?.length,
    toExchangeRate,
    toMarket?.minOrderSize,
  ]);
};
