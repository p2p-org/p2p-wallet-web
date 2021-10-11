import { ZERO } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';

const floatRegex = /^(\d*)?(\.)?(\d*)?$/;

export function parseString(amount: string, decimals: number): u64 {
  const matches = amount.match(floatRegex);

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
