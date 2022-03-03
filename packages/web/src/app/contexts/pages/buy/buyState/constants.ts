export type BuyCurrencySelectType = {
  name: string;
  symbol: string;
  currencyCode: 'sol' | 'usdc_sol';
};

export const BUY_CURRENCIES_SELECT: {
  [key: string]: BuyCurrencySelectType;
} = {
  SOL: { name: 'Solana', symbol: 'SOL', currencyCode: 'sol' },
  USDC: { name: 'USD Coin', symbol: 'USDC', currencyCode: 'usdc_sol' },
};
