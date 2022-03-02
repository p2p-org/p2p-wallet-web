import { createContainer } from 'unstated-next';
import { useConnectionContext } from "../solana";
import { networkToChainId, Token } from "@saberhq/token-utils";
import { useMemo } from "react";
import { makeTokenMap } from "./utils/makeTokenMap";

const PRIMARY_SYMBOLS = ['SOL', 'USDC', 'BTC', 'USDT', 'ETH'];

export type TokenMap = Record<string, Token>;

export interface UseTokens {
  tokens: readonly Token[];
  tokenMap: TokenMap;
}

const useTokensInternal = (): UseTokens => {
  const { network } = useConnectionContext();
  const chainId = networkToChainId(network);

  const standardTokenMap = useMemo(() => makeTokenMap(chainId), [chainId]);

  const tokenMap = useMemo(() => {
    if (!chainId) {
      return {};
    }

    return standardTokenMap;
  }, [chainId, standardTokenMap]);

  const tokens = useMemo(() => {
    const newTokenMap = { ...tokenMap };

    // Get Token Mints
    const newTokens = Object.values(newTokenMap);
    const primaryMints = PRIMARY_SYMBOLS.map((symbol) => {
      const token = newTokens.find((itemToken) => itemToken.symbol === symbol);
      return token?.address;
    }).filter(Boolean) as string[];

    // Get Primary Tokens and remove it from Token Map
    const primaryTokens = primaryMints
      .map((mint) => {
        const token = newTokenMap[mint];
        delete newTokenMap[mint];

        return token;
      })
      .filter(Boolean) as Token[];

    // Make tokens list with primary and other tokens
    return [...primaryTokens, ...Object.values(newTokenMap)];
  }, [tokenMap]);

  return {
    tokens,
    tokenMap,
  };
};

export const { Provider: TokensProvider, useContainer: useTokensContext } =
  createContainer(useTokensInternal);
