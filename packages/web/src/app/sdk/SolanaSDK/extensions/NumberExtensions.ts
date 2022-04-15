// Double

import { u64 } from '@solana/spl-token';

export function toLamport(value: number, decimals: number): u64 {
  return new u64(value).pow(new u64(decimals));
}
