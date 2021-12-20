import { useTokenAccount } from '@p2p-wallet-web/core';
import { usePubkey } from '@p2p-wallet-web/sail/dist/esm';
import { TokenAmount } from '@saberhq/token-utils';
import type { PublicKey } from '@solana/web3.js';

export const useTokenAccountAmount = (
  publicKey: PublicKey | string | null | undefined,
  value: string | undefined,
) => {
  const tokenAccount = useTokenAccount(usePubkey(publicKey));

  if (!tokenAccount?.balance?.token || !value) {
    return undefined;
  }

  try {
    return new TokenAmount(tokenAccount.balance.token, value);
  } catch (e) {
    console.warn('Error parsing token amount', e);
  }

  return undefined;
};
