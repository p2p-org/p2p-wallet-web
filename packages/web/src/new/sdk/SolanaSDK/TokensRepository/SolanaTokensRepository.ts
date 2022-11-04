import type { Token } from '../Models';

export interface SolanaTokensRepository {
  getTokensList(useCache?: boolean): Promise<Token[]>;
  getTokenWithMint(mint?: string): Promise<Token>;
}
