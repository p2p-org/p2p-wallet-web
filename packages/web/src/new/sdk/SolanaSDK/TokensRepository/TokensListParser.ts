import type { Network } from '@saberhq/solana-contrib';
import { TokenListProvider } from '@solana/spl-token-registry';

import { Token } from '../Models';

export class TokensListParser {
  constructor() {}

  async parse(network: Network): Promise<Token[]> {
    const tokenList = await new TokenListProvider().resolve();

    // map tags
    const tokens = tokenList.getList().map((item) => new Token(item));

    // TODO: Move outside parser
    // renBTC for devnet
    if (network === 'devnet') {
      tokens.push(
        new Token({
          chainId: 101,
          address: 'FsaLodPu4VmSwXGr3gWfwANe4vKf8XSZcCh1CEeJ3jpD',
          symbol: 'renBTC',
          name: 'renBTC',
          decimals: 8,
          logoURI:
            'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/CDJWUqTcYTVAKXAVXoQZFes5JUFc7owSeq7eMQcDSbo5/logo.png',
          extensions: {
            website: 'https://renproject.io/',
            serumV3Usdc: '74Ciu5yRzhe8TFTHvQuEVbFZJrbnCMRoohBK33NNiPtv',
            coingeckoId: 'renbtc',
          },
        }),
      );
    }

    return tokens;
  }
}
