import * as web3 from '@solana/web3.js';

import { TOKENS_BY_ENTRYPOINT } from 'constants/tokens';

export function populateTokenInfo({
  mint,
  entrypoint,
}: {
  mint?: web3.PublicKey;
  entrypoint: string;
}): {
  name?: string;
  symbol?: string;
  icon?: string;
} {
  if (mint) {
    const match = TOKENS_BY_ENTRYPOINT[entrypoint]?.find(
      (token) => token.mintAddress === mint.toBase58(),
    );

    if (match) {
      return { name: match.tokenName, symbol: match.tokenSymbol, icon: match.icon };
    }
  }

  return { name: undefined, symbol: undefined, icon: undefined };
}
