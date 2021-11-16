import { useEffect, useState } from 'react';
import { useAsync } from 'react-async-hook';

import { Orderbook as OrderbookSide } from '@project-serum/serum/lib/market';
import type { PublicKey } from '@solana/web3.js';

import { useDex } from '../provider';
import { useMarket } from './useMarket';

type Orderbook = {
  bids: OrderbookSide;
  asks: OrderbookSide;
};

const _ORDERBOOK_CACHE = new Map<string, Promise<Orderbook>>();

// Lazy load the orderbook for a given market.
export function useOrderbook(market?: PublicKey): Orderbook | undefined {
  const { swapClient } = useDex();
  const marketClient = useMarket(market);
  const [refresh, setRefresh] = useState(0);

  const asyncOrderbook = useAsync(async () => {
    if (!market || !marketClient) {
      return undefined;
    }

    if (_ORDERBOOK_CACHE.get(market.toString())) {
      return _ORDERBOOK_CACHE.get(market.toString());
    }

    const orderbook = new Promise<Orderbook>(async (resolve) => {
      const [bids, asks] = await Promise.all([
        marketClient.loadBids(swapClient.program.provider.connection),
        marketClient.loadAsks(swapClient.program.provider.connection),
      ]);

      resolve({
        bids,
        asks,
      });
    });

    _ORDERBOOK_CACHE.set(market.toString(), orderbook);

    return orderbook;
  }, [refresh, swapClient.program.provider.connection, market, marketClient]);

  // Stream in bids updates.
  useEffect(() => {
    let listener: number | undefined;

    if (marketClient?.bidsAddress) {
      listener = swapClient.program.provider.connection.onAccountChange(
        marketClient?.bidsAddress,
        async (info) => {
          const bids = OrderbookSide.decode(marketClient, info.data);
          const orderbook = await _ORDERBOOK_CACHE.get(marketClient.address.toString());
          const oldBestBid = orderbook?.bids.items(true).next().value;
          const newBestBid = bids.items(true).next().value;
          if (orderbook && oldBestBid && newBestBid && oldBestBid.price !== newBestBid.price) {
            orderbook.bids = bids;
            setRefresh((r) => r + 1);
          }
        },
      );
    }

    return () => {
      if (listener) {
        swapClient.program.provider.connection.removeAccountChangeListener(listener);
      }
    };
  }, [marketClient, marketClient?.bidsAddress, swapClient.program.provider.connection]);

  // Stream in asks updates.
  useEffect(() => {
    let listener: number | undefined;

    if (marketClient?.asksAddress) {
      listener = swapClient.program.provider.connection.onAccountChange(
        marketClient?.asksAddress,
        async (info) => {
          const asks = OrderbookSide.decode(marketClient, info.data);
          const orderbook = await _ORDERBOOK_CACHE.get(marketClient.address.toString());
          const oldBestOffer = orderbook?.asks.items(false).next().value;
          const newBestOffer = asks.items(false).next().value;
          if (
            orderbook &&
            oldBestOffer &&
            newBestOffer &&
            oldBestOffer.price !== newBestOffer.price
          ) {
            orderbook.asks = asks;
            setRefresh((r) => r + 1);
          }
        },
      );
    }

    return () => {
      if (listener) {
        swapClient.program.provider.connection.removeAccountChangeListener(listener);
      }
    };
  }, [marketClient, marketClient?.bidsAddress, swapClient.program.provider.connection]);

  if (asyncOrderbook.result) {
    return asyncOrderbook.result;
  }

  return undefined;
}
