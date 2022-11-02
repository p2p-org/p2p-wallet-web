import type { Token } from 'new/sdk/SolanaSDK';
import { Defaults } from 'new/services/Defaults';

export const maxSlippage = 0.5;

export function numberToString(
  value: number,
  {
    maximumFractionDigits = 3,
    showPlus = false,
    showMinus = true,
    groupingSeparator = ' ',
    autoSetMaximumFractionDigits = false,
  }: {
    maximumFractionDigits?: number;
    showPlus?: boolean;
    showMinus?: boolean;
    groupingSeparator?: string | null;
    autoSetMaximumFractionDigits?: boolean;
  },
): string {
  const options: Intl.NumberFormatOptions = {};

  if (showPlus) {
    // @ts-ignore
    options.signDisplay = 'exceptZero';
  }

  if (!autoSetMaximumFractionDigits) {
    options.maximumFractionDigits = maximumFractionDigits;
  } else {
    if (value > 1000) {
      options.maximumFractionDigits = 2;
    } else if (value > 100) {
      options.maximumFractionDigits = 4;
    } else {
      options.maximumFractionDigits = 9;
    }
  }

  const number = showMinus ? value : Math.abs(value);
  let _value = number.toLocaleString('en-US', options);
  if (typeof groupingSeparator === 'string') {
    _value = _value.replace(/,/g, groupingSeparator);
  }
  return _value;
}

// TODO: rename
export const numberToFiatString = (value: number, maximumFractionDigits = 2) => {
  return `${Defaults.fiat.symbol} ${numberToString(value, { maximumFractionDigits })}`;
};

// TODO: rename
export const numberToTokenString = (value: number, token: Token) => {
  return `${numberToString(value, { maximumFractionDigits: token.decimals ?? 9 })} ${token.symbol}`;
};

export function rounded(value: number, decimals?: number): number {
  if (!decimals) {
    return value;
  }
  const realAmount = numberToString(value, {
    maximumFractionDigits: decimals,
    groupingSeparator: '',
  });
  return Number(realAmount);
}
