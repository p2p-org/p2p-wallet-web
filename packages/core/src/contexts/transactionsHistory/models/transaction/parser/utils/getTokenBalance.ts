import type { ParsedMessageAccount, TokenBalance } from '@solana/web3.js';

export const getTokenBalance = (
  accountKeys: ParsedMessageAccount[],
  tokenBalances: TokenBalance[] | null | undefined,
  publicKey: string,
): TokenBalance | undefined => {
  if (!tokenBalances) {
    return undefined;
  }

  const accountIndex = accountKeys.findIndex(
    (accountKey) => accountKey.pubkey.toBase58() === publicKey,
  );
  return tokenBalances.find((tokenBalance) => tokenBalance.accountIndex === accountIndex);
};
