import { useRates } from '../provider';

export const useMarketRate = (symbol?: string) => {
  const { markets } = useRates();

  if (!symbol) {
    return null;
  }

  const marketRate = markets[symbol];

  if (!marketRate) {
    return null;
  }

  return marketRate;
};
