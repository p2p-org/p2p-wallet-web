import { useAsync } from 'react-async-hook';

import type { MintInfo } from '@solana/spl-token';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import type { PublicKey } from '@solana/web3.js';
import { Account } from '@solana/web3.js';

import { _MINT_CACHE } from '../common/cache';
import { useToken } from '../index';

export function useMint(mint?: PublicKey): MintInfo | undefined | null {
  const { provider } = useToken();
  // Lazy load the mint account if needeed.
  const asyncMintInfo = useAsync(async () => {
    if (!mint) {
      return undefined;
    }

    if (_MINT_CACHE.get(mint.toString())) {
      return _MINT_CACHE.get(mint.toString());
    }

    const mintClient = new Token(provider.connection, mint, TOKEN_PROGRAM_ID, new Account());
    const mintInfo = mintClient.getMintInfo();
    _MINT_CACHE.set(mint.toString(), mintInfo);

    return mintInfo;
  }, [provider.connection, mint]);

  if (asyncMintInfo.result) {
    return asyncMintInfo.result;
  }
  return undefined;
}
