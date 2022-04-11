import type { TokenAccount } from '@p2p-wallet-web/core';
import type { ReadonlyProvider } from '@saberhq/solana-contrib';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

import { isValidSolanaAddress } from 'app/contexts';

type CheckUserHasTokenAccount = (
  pubKey: string,
  fromTokenAccount: TokenAccount | null | undefined,
  provider: ReadonlyProvider,
) => Promise<boolean>;

/*
 * Checks if user has a token account by his public key and mint address
 */
export const isUserHasTokenAccount: CheckUserHasTokenAccount = async (
  pubKey,
  fromTokenAccount,
  provider,
) => {
  const isSolanaToken = fromTokenAccount?.balance?.token?.isRawSOL;

  if (isSolanaToken) {
    return true;
  } else if (pubKey && !isValidSolanaAddress(pubKey)) {
    return false;
  } else if (pubKey) {
    const addressTokenAccount = await provider.connection.getTokenAccountsByOwner(
      new PublicKey(pubKey),
      {
        programId: TOKEN_PROGRAM_ID,
        mint: fromTokenAccount?.balance?.token?.mintAccount,
      },
    );

    return Boolean(addressTokenAccount.value.length);
  }

  return true;
};
