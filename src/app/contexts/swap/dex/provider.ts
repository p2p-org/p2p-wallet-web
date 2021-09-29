import { useEffect, useState } from 'react';

import * as anchor from '@project-serum/anchor';
import { Market, OpenOrders } from '@project-serum/serum';
import { Swap as SwapClient } from '@project-serum/swap';
import { MintLayout } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import * as assert from 'assert';
import { createContainer } from 'unstated-next';

import { DEX_PID } from '../common/constants';
import { setMintCache } from '../token/utils/setMintCache';
import { _MARKET_CACHE } from './common/cache';

const BASE_TAKER_FEE_BPS = 0.0022;
export const FEE_MULTIPLIER = 1 - BASE_TAKER_FEE_BPS;

export interface UseDex {
  // Maps market address to open orders accounts.
  openOrders: Map<string, Array<OpenOrders>>;
  closeOpenOrders: (openOrder: OpenOrders) => void;
  swapClient: SwapClient;
}

const useDexInternal = (props: any): UseDex => {
  const [ooAccounts, setOoAccounts] = useState<Map<string, Array<OpenOrders>>>(new Map());
  const swapClient = props.swapClient;

  // Removes the given open orders from the context.
  const closeOpenOrders = async (openOrder: OpenOrders) => {
    const newOoAccounts = new Map(ooAccounts);
    const openOrders = newOoAccounts
      .get(openOrder.market.toString())
      ?.filter((oo: OpenOrders) => !oo.address.equals(openOrder.address));

    if (openOrders && openOrders.length > 0) {
      newOoAccounts.set(openOrder.market.toString(), openOrders);
    } else {
      newOoAccounts.delete(openOrder.market.toString());
    }

    setOoAccounts(newOoAccounts);
  };

  // Three operations:
  //
  // 1. Fetch all open orders accounts for the connected wallet.
  // 2. Batch fetch all market accounts for those open orders.
  // 3. Batch fetch all mints associated with the markets.
  useEffect(() => {
    if (!swapClient.program.provider.wallet.publicKey) {
      setOoAccounts(new Map());
      return;
    }

    OpenOrders.findForOwner(
      swapClient.program.provider.connection,
      swapClient.program.provider.wallet.publicKey,
      DEX_PID,
    ).then(async (openOrders) => {
      const newOoAccounts = new Map();
      let markets = new Set<string>();
      openOrders.forEach((oo) => {
        markets.add(oo.market.toString());
        if (newOoAccounts.get(oo.market.toString())) {
          newOoAccounts.get(oo.market.toString()).push(oo);
        } else {
          newOoAccounts.set(oo.market.toString(), [oo]);
        }
      });

      if (markets.size > 100) {
        // Punt request chunking until there's user demand.
        throw new Error('Too many markets. Please file an issue to update this');
      }

      const multipleMarkets = await anchor.utils.rpc.getMultipleAccounts(
        swapClient.program.provider.connection,
        Array.from(markets.values()).map((m) => new PublicKey(m)),
      );

      const marketClients = multipleMarkets.map((programAccount) => {
        return {
          publicKey: programAccount?.publicKey,
          account: new Market(
            Market.getLayout(DEX_PID).decode(programAccount?.account.data),
            -1, // Set below so that we can batch fetch mints.
            -1, // Set below so that we can batch fetch mints.
            swapClient.program.provider.opts,
            DEX_PID,
          ),
        };
      });

      setOoAccounts(newOoAccounts);

      // Batch fetch all the mints, since we know we'll need them at some
      // point.
      const mintPubkeys = Array.from(
        new Set<string>(
          marketClients
            .map((m) => [
              m.account.baseMintAddress.toString(),
              m.account.quoteMintAddress.toString(),
            ])
            .flat(),
        ).values(),
      ).map((pk) => new PublicKey(pk));

      if (mintPubkeys.length > 100) {
        // Punt request chunking until there's user demand.
        throw new Error('Too many mints. Please file an issue to update this');
      }

      const mints = await anchor.utils.rpc.getMultipleAccounts(
        swapClient.program.provider.connection,
        mintPubkeys,
      );

      const mintInfos = mints.map((mint) => {
        const mintInfo = MintLayout.decode(mint!.account.data);
        setMintCache(mint!.publicKey, mintInfo);
        return { publicKey: mint!.publicKey, mintInfo };
      });

      marketClients.forEach((m) => {
        const baseMintInfo = mintInfos.filter((mint) =>
          mint.publicKey.equals(m.account.baseMintAddress),
        )[0];
        const quoteMintInfo = mintInfos.filter((mint) =>
          mint.publicKey.equals(m.account.quoteMintAddress),
        )[0];
        assert.ok(baseMintInfo && quoteMintInfo);
        // @ts-ignore
        m.account._baseSplTokenDecimals = baseMintInfo.mintInfo.decimals;
        // @ts-ignore
        m.account._quoteSplTokenDecimals = quoteMintInfo.mintInfo.decimals;
        _MARKET_CACHE.set(
          m.publicKey!.toString(),
          new Promise<Market>((resolve) => resolve(m.account)),
        );
      });
    });
  }, [
    swapClient.program.provider.connection,
    swapClient.program.provider.wallet.publicKey,
    swapClient.program.provider.opts,
  ]);

  return {
    openOrders: ooAccounts,
    closeOpenOrders,
    swapClient,
  };
};

export const { Provider: DexProvider, useContainer: useDex } = createContainer(useDexInternal);
