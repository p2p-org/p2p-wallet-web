import { useAsync } from 'react-async-hook';

import { Market } from '@project-serum/serum';
import type { PublicKey } from '@solana/web3.js';

import { DEX_PID } from '../../common/constants';
import { _MARKET_CACHE } from '../common/cache';
import { useDex } from '../provider';

// Lazy load a given market.
export function useMarket(market?: PublicKey): Market | undefined {
  const { swapClient } = useDex();

  const asyncMarket = useAsync(async () => {
    if (!market) {
      return undefined;
    }
    if (_MARKET_CACHE.get(market.toString())) {
      return _MARKET_CACHE.get(market.toString());
    }

    const marketClient = new Promise<Market>(async (resolve) => {
      // TODO: if we already have the mints, then pass them through to the
      //       market client here to save a network request.
      const marketClient = await Market.load(
        swapClient.program.provider.connection,
        market,
        swapClient.program.provider.opts,
        DEX_PID,
      );

      console.log(market.toString(), marketClient);

      resolve(marketClient);
    });

    _MARKET_CACHE.set(market.toString(), marketClient);
    return marketClient;
  }, [swapClient.program.provider.connection, market]);

  if (asyncMarket.result) {
    return asyncMarket.result;
  }

  return undefined;
}
