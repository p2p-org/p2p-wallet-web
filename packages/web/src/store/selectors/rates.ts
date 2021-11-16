import type { RootState } from 'store/rootReducer';

export const rateSelector = (symbol?: string) => (state: RootState) => {
  if (!symbol) {
    return null;
  }

  const rate = state.rate.markets[symbol];

  if (!rate) {
    return null;
  }

  return rate;
};
