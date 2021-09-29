import { AccountInfo as TokenAccount, MintInfo } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import { SOL_MINT } from 'app/contexts/swap/common/constants';

// Cache storing all token accounts for the connected wallet provider.
export const _OWNED_TOKEN_ACCOUNTS_CACHE: Array<{
  publicKey: PublicKey;
  account: TokenAccount;
}> = [];

// Cache storing all previously fetched mint infos.
export const _MINT_CACHE = new Map<string, Promise<MintInfo>>([
  // @ts-ignore
  [SOL_MINT.toString(), { decimals: 9 }],
]);
