import { MintInfo } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import { _MINT_CACHE } from '../common/cache';

export function setMintCache(pk: PublicKey, account: MintInfo) {
  _MINT_CACHE.set(pk.toString(), new Promise((resolve) => resolve(account)));
}
