import type { Token } from 'new/sdk/SolanaSDK';

export const getTokenPriority = (token: Token): number => {
  switch (token.symbol) {
    case 'SOL':
      return Number.MAX_SAFE_INTEGER;
    case 'USDC':
      return Number.MAX_SAFE_INTEGER - 1;
    case 'BTC':
      return Number.MAX_SAFE_INTEGER - 2;
    case 'USDT':
      return Number.MAX_SAFE_INTEGER - 3;
    case 'ETH':
      return Number.MAX_SAFE_INTEGER - 4;
    default:
      return 0;
  }
};
