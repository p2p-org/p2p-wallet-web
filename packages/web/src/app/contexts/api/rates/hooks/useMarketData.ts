import { useMemo } from 'react';

import { useMarketsData } from './useMarketsData';

export const useMarketData = (symbol?: string) => {
  const _symbol = symbol?.toUpperCase();
  const theSymbol = useMemo(() => [_symbol], [_symbol]);
  const data = useMarketsData(theSymbol);
  return {
    loading: _symbol !== undefined && data[_symbol] === undefined,
    data: _symbol ? data[_symbol] : undefined,
  };
};
