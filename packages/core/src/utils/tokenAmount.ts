import type { Token } from '@saberhq/token-utils';
import { TokenAmount } from '@saberhq/token-utils';

export const tryParseTokenAmount = (
  token: Token | null | undefined,
  value: string | undefined,
): TokenAmount | undefined => {
  if (!token || !value) {
    return undefined;
  }

  try {
    return TokenAmount.parse(token, value);
  } catch (e) {
    console.warn('Error parsing token amount', e);
  }

  return undefined;
};
