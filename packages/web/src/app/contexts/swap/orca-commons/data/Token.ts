import { PublicKey } from '@solana/web3.js';

import type { TokenConfigs, TokenJSONS } from '../types';

export function createTokenConfig(tokenJsons: TokenJSONS): TokenConfigs {
  return Object.entries(tokenJsons).reduce((configs, token) => {
    const [tokenName, obj] = token;

    configs[tokenName] = Object.assign({}, obj, {
      mint: new PublicKey(obj.mint),
      identifier: obj.identifier || tokenName,
    });

    return configs;
  }, {} as TokenConfigs);
}
