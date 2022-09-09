import { u64 } from '@solana/spl-token';
import BN from 'bn.js';

// u64

export function convertToBalance(value: BN, decimals?: number): number {
  if (!decimals) {
    return 0;
  }

  const divisor = new BN(10).pow(new BN(decimals));
  const quotient = value.div(divisor);
  const remainder = value.mod(divisor);
  return quotient.toNumber() + remainder.toNumber() / divisor.toNumber();

  // return new Fraction(value, makeDecimalMultiplier(decimals)).asNumber;
  // return value.mul(new BN(10).pown(-decimals)).
}

// Number

// TODO: find better precision way for bignumber
export function toLamport(value: number, decimals: number): u64 {
  return new u64(Math.round(value * 10 ** decimals));
}
