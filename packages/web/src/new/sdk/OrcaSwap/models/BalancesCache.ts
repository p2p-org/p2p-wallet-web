import type { Pool } from 'new/sdk/OrcaSwap';
import type { TokenAccountBalance } from 'new/sdk/SolanaSDK';

export class BalancesCache {
  balancesCache: Record<string, TokenAccountBalance> = {};

  getTokenABalance(pool: Pool): TokenAccountBalance | undefined {
    return pool.tokenABalance ?? this.balancesCache[pool.tokenAccountA.toString()];
  }

  getTokenBBalance(pool: Pool): TokenAccountBalance | undefined {
    return pool.tokenBBalance ?? this.balancesCache[pool.tokenAccountB.toString()];
  }

  save(key: string, value: TokenAccountBalance): void {
    this.balancesCache[key] = value;
  }
}
