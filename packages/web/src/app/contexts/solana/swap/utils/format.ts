import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';

import { countDecimals } from './math';

const floatRegex = /^(\d*)?(\.)?(\d*)?$/;
const MAX_SIGNIFICANT_DIGITS = 5;

export function parseString(amount: string, decimals: number): u64 {
  const matches = floatRegex.exec(amount);

  if (!matches) {
    return ZERO;
  }

  const integers = matches[1] ? new u64(matches[1]) : ZERO;
  const fractions = matches[3]
    ? new u64(matches[3].substring(0, decimals).padEnd(decimals, '0'))
    : ZERO;
  const base = new u64(10).pow(new u64(decimals));
  const result = integers.mul(base).add(fractions);
  return new u64(result.toString());
}

// Convert a u64 integer into its string representation
// Only show up to MAX_SIGNIFICANT_DIGITS digits
// 1.01 -> 1.01
// 100 -> 100
// 0.123456789 -> 0.12345
// 0.001234567 -> 0.0012345
// 1.012345678 -> 1.0123
// 12345.6789 -> 12345
export function formatBigNumber(
  amount: u64,
  decimals: number,
  maxSignificantDigits = MAX_SIGNIFICANT_DIGITS,
): string {
  const base = new u64(10).pow(new u64(decimals));
  const integers = amount.div(base);
  const fractions = amount.umod(base);
  if (fractions.isZero()) {
    return integers.toString();
  }

  const significantDigits = amount.toString().replace(/^0+/, '').replace(/0+$/, '').length;
  const numLeadingZeros = decimals - fractions.toString().length;
  const numDigits = Math.min(significantDigits, maxSignificantDigits);
  const numFractionDigits = integers.eq(ZERO)
    ? numLeadingZeros + numDigits
    : numDigits - integers.toString().length;

  const fractionsString = fractions
    .toString()
    .padStart(decimals, '0')
    .substring(0, numFractionDigits);

  if (!fractionsString.length) {
    return integers.toString();
  }

  return `${integers.toString()}.${fractionsString}`;
}

export function getUSDValue(amount: u64, decimals: number, price: number): number {
  return getNumber(amount, decimals) * price;
}

export function getNumber(amount: u64, decimals: number): number {
  return parseFloat(formatBigNumber(amount, decimals));
}

export function formatNumberToUSD(
  amount: number,
  options: { showCents: boolean } = { showCents: true },
) {
  const numFractionDigits = options.showCents ? 2 : 0;
  const numWithFixedFractionDigits = amount.toFixed(numFractionDigits);
  if (numWithFixedFractionDigits === '0' || numWithFixedFractionDigits === '0.00') {
    const numWithFixedSigFigs = amount.toPrecision(3);
    const numDecimals = countDecimals(numWithFixedSigFigs);
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: numDecimals,
      maximumFractionDigits: numDecimals,
    });
  }
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: numFractionDigits,
  });
}
