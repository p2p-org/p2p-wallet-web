import type { Token } from 'new/sdk/SolanaSDK';

export function excludingSpecialTokens(tokens: Token[]): Token[] {
  return tokens.filter(
    (token) =>
      !token.tags.some(
        (tag) => tag === 'nft' || tag === 'leveraged' || tag === 'bull' || tag === 'lp-token',
      ),
  );
}
