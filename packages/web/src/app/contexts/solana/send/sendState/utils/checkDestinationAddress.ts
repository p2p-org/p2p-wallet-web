import type { TokenAccount } from '@p2p-wallet-web/core';
import type { ReadonlyProvider } from '@saberhq/solana-contrib';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

type CheckDestinationAddress = (
  pubKey: string,
  fromTokenAccount: TokenAccount | null | undefined,
  provider: ReadonlyProvider,
) => Promise<boolean>;
export const checkDestinationAddress: CheckDestinationAddress = async (
  pubKey,
  fromTokenAccount,
  provider,
) => {
  const isSolanaToken = fromTokenAccount?.balance?.token?.isRawSOL;
  let userHasTokenAccount = true;

  if (isSolanaToken) {
    return userHasTokenAccount;
  } else if (pubKey) {
    const addressTokenAccount = await provider.connection.getTokenAccountsByOwner(
      new PublicKey(pubKey),
      {
        programId: TOKEN_PROGRAM_ID,
        mint: fromTokenAccount?.balance?.token?.mintAccount,
      },
    );

    userHasTokenAccount = Boolean(addressTokenAccount.value.length);
  }

  return userHasTokenAccount;
};
