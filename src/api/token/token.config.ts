import { TokenListContainer } from '@solana/spl-token-registry';
import defaultTokenlist from '@solana/spl-token-registry/dist/main/tokens/solana.tokenlist.json';

// eslint-disable-next-line import/no-default-export
export default new TokenListContainer(defaultTokenlist.tokens);
