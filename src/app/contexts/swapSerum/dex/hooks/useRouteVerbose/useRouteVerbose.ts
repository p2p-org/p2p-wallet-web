import { useAsync } from 'react-async-hook';

import { TokenInfo } from '@solana/spl-token-registry';
import { Connection, PublicKey } from '@solana/web3.js';

import {
  DEX_PID,
  SOL_MINT,
  USDC_MINT,
  USDT_MINT,
  WORM_MARKET_BASE,
  WORM_USDC_MARKET,
  WORM_USDC_MINT,
  WORM_USDT_MARKET,
  WORM_USDT_MINT,
  WRAPPED_SOL_MINT,
} from '../../../common/constants';
import { useTokenList } from '../../../tokenList';
import { useDex } from '../../provider';
import { fetchSolletInfo, requestWormholeSwapMarketIfNeeded } from './utils';

// Wormhole utils.

function wormKey(fromMint: PublicKey, toMint: PublicKey): string {
  const [first, second] = fromMint < toMint ? [fromMint, toMint] : [toMint, fromMint];
  return first.toString() + second.toString();
}

// Maps fromMint || toMint (in sort order) to swap market public key.
// All markets for wormhole<->native tokens should be here, e.g.
// USDC <-> wUSDC.
const WORMHOLE_NATIVE_MAP = new Map<string, PublicKey>([
  [wormKey(WORM_USDC_MINT, USDC_MINT), WORM_USDC_MARKET],
  [wormKey(WORM_USDT_MINT, USDT_MINT), WORM_USDT_MARKET],
]);

function wormholeNativeMarket(fromMint: PublicKey, toMint: PublicKey): PublicKey | null {
  return WORMHOLE_NATIVE_MAP.get(wormKey(fromMint, toMint)) ?? null;
}

// Calculates the deterministic address for the sollet<->wormhole 1-1 swap
// market.
async function deriveWormholeMarket(
  baseMint: PublicKey,
  quoteMint: PublicKey,
  version = 0,
): Promise<PublicKey | null> {
  if (version > 99) {
    console.log('Swap market version cannot be greater than 99');
    return null;
  }
  if (version < 0) {
    console.log('Version cannot be less than zero');
    return null;
  }

  const padToTwo = (n: number) => (n <= 99 ? `0${n}`.slice(-2) : n);
  const seed =
    baseMint.toString().slice(0, 15) + quoteMint.toString().slice(0, 15) + padToTwo(version);
  return await PublicKey.createWithSeed(WORM_MARKET_BASE, seed, DEX_PID);
}

// Returns the market address of the 1-1 sollet<->wormhole swap market if it
// exists. Otherwise, returns null.
async function wormholeSolletMarket(
  conn: Connection,
  fromMint: PublicKey,
  toMint: PublicKey,
  wormholeMap: Map<string, TokenInfo>,
  solletMap: Map<string, TokenInfo>,
): Promise<PublicKey | null> {
  const fromWormhole = wormholeMap.get(fromMint.toString());
  const isFromWormhole = fromWormhole !== undefined;

  const toWormhole = wormholeMap.get(toMint.toString());
  const isToWormhole = toWormhole !== undefined;

  const fromSollet = solletMap.get(fromMint.toString());
  const isFromSollet = fromSollet !== undefined;

  const toSollet = solletMap.get(toMint.toString());
  const isToSollet = toSollet !== undefined;

  if ((isFromWormhole || isToWormhole) && isFromWormhole !== isToWormhole) {
    if ((isFromSollet || isToSollet) && isFromSollet !== isToSollet) {
      const base = isFromSollet ? fromMint : toMint;
      const [quote, wormholeInfo] = isFromWormhole
        ? [fromMint, fromWormhole]
        : [toMint, toWormhole];

      const solletInfo = await fetchSolletInfo(base);

      if (solletInfo.erc20Contract !== wormholeInfo!.extensions?.address) {
        return null;
      }

      const market = await deriveWormholeMarket(base, quote);
      if (market === null) {
        return null;
      }

      const marketExists = await requestWormholeSwapMarketIfNeeded(
        conn,
        base,
        quote,
        market,
        solletInfo,
      );
      if (!marketExists) {
        return null;
      }

      return market;
    }
  }
  return null;
}

async function wormholeSwapMarket(
  conn: Connection,
  fromMint: PublicKey,
  toMint: PublicKey,
  wormholeMap: Map<string, TokenInfo>,
  solletMap: Map<string, TokenInfo>,
): Promise<[PublicKey, RouteKind] | null> {
  let market = wormholeNativeMarket(fromMint, toMint);
  if (market !== null) {
    return [market, 'wormhole-native'];
  }
  market = await wormholeSolletMarket(conn, fromMint, toMint, wormholeMap, solletMap);
  if (market === null) {
    return null;
  }
  return [market, 'wormhole-sollet'];
}

type RouteKind = 'wormhole-native' | 'wormhole-sollet' | 'usdx';

// Types of routes.
//
// 1. Direct trades on USDC quoted markets.
// 2. Transitive trades across two USDC qutoed markets.
// 3. Wormhole <-> Sollet one-to-one swap markets.
// 4. Wormhole <-> Native one-to-one swap markets.
//
export function useRouteVerbose(
  fromMint: PublicKey,
  toMint: PublicKey,
): { markets: Array<PublicKey>; kind: RouteKind } | null {
  const { swapClient } = useDex();
  const { wormholeMap, solletMap } = useTokenList();

  const asyncRoute = useAsync(async () => {
    const swapMarket = await wormholeSwapMarket(
      swapClient.program.provider.connection,
      fromMint,
      toMint,
      wormholeMap,
      solletMap,
    );

    if (swapMarket !== null) {
      const [wormholeMarket, kind] = swapMarket;
      return { markets: [wormholeMarket], kind };
    }

    const markets = swapClient.route(
      fromMint.equals(SOL_MINT) ? WRAPPED_SOL_MINT : fromMint,
      toMint.equals(SOL_MINT) ? WRAPPED_SOL_MINT : toMint,
    );

    if (markets === null) {
      return null;
    }

    const kind: RouteKind = 'usdx';
    return { markets, kind };
  }, [fromMint, toMint, swapClient]);

  if (asyncRoute.result) {
    return asyncRoute.result;
  }

  return null;
}
