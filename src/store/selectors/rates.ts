import { RootState } from 'store/rootReducer';

export const rateSelector = (symbol?: string) => (state: RootState) => {
  if (!symbol) {
    return null;
  }

  const rate = state.rate.markets[`${symbol}/USDT`];

  if (['USDT', 'USDC'].includes(symbol)) {
    return rate || 1;
  }

  if (!rate) {
    return null;
  }

  return rate;
};
