import { useMemo } from "react";

import { TokenAmount } from "@p2p-wallet-web/token-utils";
import type { Token } from "@saberhq/token-utils";

/**
 * Parses a {@link TokenAmount}.
 * @param token The token.
 * @param valueStr The string representation of the amount.
 * @returns
 */
export const useTokenAmount = (
  token: Token | null | undefined,
  valueStr: string
): TokenAmount | null | undefined => {
  return useMemo(() => {
    if (!token) {
      return token;
    }
    if (!valueStr) {
      return null;
    }
    try {
      return TokenAmount.parse(token, valueStr);
    } catch (e) {
      return null;
    }
  }, [token, valueStr]);
};
