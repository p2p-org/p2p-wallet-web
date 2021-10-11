import { PublicKey } from '@solana/web3.js';

import { useTokenMap } from '../../tokenList/hooks/useTokenMap';
import { useMarket } from './useMarket';

export function useMarketName(market: PublicKey): string | null {
  const tokenMap = useTokenMap();
  const marketClient = useMarket(market);

  if (!marketClient) {
    return null;
  }

  const baseTicker = marketClient
    ? tokenMap.get(marketClient?.baseMintAddress.toString())?.symbol
    : '-';
  const quoteTicker = marketClient
    ? tokenMap.get(marketClient?.quoteMintAddress.toString())?.symbol
    : '-';

  const name = `${baseTicker} / ${quoteTicker}`;
  return name;
}
