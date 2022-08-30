import type { Token } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';

export function numberToString(
  value: number,
  {
    maximumFractionDigits = 3,
    groupingSeparator = ' ',
  }: {
    maximumFractionDigits?: number;
    groupingSeparator?: string;
  },
): string {
  return value.toLocaleString('en-US', { maximumFractionDigits }).replace(/,/g, groupingSeparator);
}

export const numberToFiatString = (value: number) => {
  return Defaults.fiat.symbol + numberToString(value, { maximumFractionDigits: 2 });
};

export const numberToTokenString = (value: number, token: Token) => {
  return numberToString(value, { maximumFractionDigits: token.decimals || 9 }) + ' ' + token.symbol;
};
