import type { Token } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';

export function numberToString(
  value: number,
  {
    maximumFractionDigits = 3,
    groupingSeparator = ' ',
    autoSetMaximumFractionDigits = false,
  }: {
    maximumFractionDigits?: number;
    groupingSeparator?: string;
    autoSetMaximumFractionDigits?: boolean;
  },
): string {
  let _maximumFractionDigits = maximumFractionDigits;
  if (autoSetMaximumFractionDigits) {
    if (value > 1000) {
      _maximumFractionDigits = 2;
    } else if (value > 100) {
      _maximumFractionDigits = 4;
    } else {
      _maximumFractionDigits = 9;
    }
  }

  return value
    .toLocaleString('en-US', { maximumFractionDigits: _maximumFractionDigits })
    .replace(/,/g, groupingSeparator);
}

export const numberToFiatString = (value: number) => {
  return Defaults.fiat.symbol + numberToString(value, { maximumFractionDigits: 2 });
};

export const numberToTokenString = (value: number, token: Token) => {
  return numberToString(value, { maximumFractionDigits: token.decimals || 9 }) + ' ' + token.symbol;
};
