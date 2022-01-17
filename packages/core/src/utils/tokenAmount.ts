import type { Token } from '@saberhq/token-utils';
import { TokenAmount } from '@saberhq/token-utils';

export const tryParseTokenAmount = (
  token: Token | null | undefined,
  uiAmount: string | undefined,
): TokenAmount | undefined => {
  if (!token || !uiAmount) {
    return undefined;
  }

  try {
    return TokenAmount.parse(token, uiAmount);
  } catch (e) {
    console.warn('Error parsing token amount', e);
  }

  return undefined;
};

export const tryTokenAmount = (
  token: Token | null | undefined,
  amount: string | undefined,
): TokenAmount | undefined => {
  if (!token || !amount) {
    return undefined;
  }

  try {
    return new TokenAmount(token, amount);
  } catch (e) {
    console.warn('Error new token amount', e);
  }

  return undefined;
};
