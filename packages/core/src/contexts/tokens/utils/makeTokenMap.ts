import { ChainId, chainIdToNetwork, RAW_SOL, RAW_SOL_MINT, Token } from '@saberhq/token-utils';
import { StaticTokenListResolutionStrategy } from '@solana/spl-token-registry';

export const STATIC_TOKEN_LIST = new StaticTokenListResolutionStrategy().resolve();

export const makeTokenMap = (chainId: ChainId): Record<string, Token> => {
  const tokenMap: Record<string, Token> = {};
  STATIC_TOKEN_LIST.filter((token) => token.chainId === chainId).forEach((item) => {
    tokenMap[item.address] = new Token(item);
  });

  // Native SOL
  tokenMap[RAW_SOL_MINT.toBase58()] = RAW_SOL[chainIdToNetwork(chainId)];

  if (chainId === ChainId.Devnet) {
    tokenMap['FsaLodPu4VmSwXGr3gWfwANe4vKf8XSZcCh1CEeJ3jpD'] = new Token({
      chainId: 101,
      address: 'FsaLodPu4VmSwXGr3gWfwANe4vKf8XSZcCh1CEeJ3jpD',
      name: 'renBTC',
      decimals: 8,
      symbol: 'RENBTC',
    });
  }

  return tokenMap;
};
