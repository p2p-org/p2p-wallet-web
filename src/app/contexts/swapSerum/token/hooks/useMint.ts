import { useAsync } from 'react-async-hook';

import { MintInfo, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Account, PublicKey } from '@solana/web3.js';

import { useToken } from '../../token';
import { _MINT_CACHE } from '../common/cache';

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
