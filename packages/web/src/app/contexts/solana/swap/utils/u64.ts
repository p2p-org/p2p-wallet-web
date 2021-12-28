import { u64 } from '@solana/spl-token';

// @blockchain/spl-token v0.0.13 has a bug where
// u64.fromBuffer returns `BN` rather than `u64`
export function u64FromBuffer(buffer: Buffer): u64 {
  return new u64(u64.fromBuffer(buffer).toString());
}
