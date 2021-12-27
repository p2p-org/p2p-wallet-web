import { ONE, ZERO } from '@orca-so/sdk';
import type { u64 } from '@solana/spl-token';

export function ceilingDivision(dividend: u64, divisor: u64): [u64, u64] {
  let quotient = dividend.div(divisor);
  if (quotient.eq(ZERO)) {
    return [ZERO, divisor];
  }

  let remainder = dividend.mod(divisor);
  if (remainder.gt(ZERO)) {
    quotient = quotient.add(ONE);
    divisor = dividend.div(quotient);
    remainder = dividend.mod(quotient);
    if (remainder.gt(ZERO)) {
      divisor = divisor.add(ONE);
    }
  }

  return [quotient, divisor];
}

export function countDecimals(input: string): number {
  if (input.indexOf('.') === -1) return 0;
  return (input && input.split('.')[1].length) || 0;
}
