import type { ChainId } from '@saberhq/token-utils';
import { Token } from '@saberhq/token-utils';
import { StaticTokenListResolutionStrategy } from '@solana/spl-token-registry';

export const STATIC_TOKEN_LIST = new StaticTokenListResolutionStrategy().resolve();

export const makeTokenMap = (chainId: ChainId): Record<string, Token> => {
  const ret: Record<string, Token> = {};
  STATIC_TOKEN_LIST.filter((token) => token.chainId === chainId).forEach((item) => {
    ret[item.address] = new Token(item);
  });
  return ret;
};
