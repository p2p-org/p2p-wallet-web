import { useMemo } from 'react';

import { useMarketsData } from './useMarketsData';

export const useMarketData = (key?: string) => {
  const _key = key?.toUpperCase();
  const theKey = useMemo(() => [_key], [_key]);
  const data = useMarketsData(theKey);
  return {
    loading: _key !== undefined && data[_key] === undefined,
    data: _key ? data[_key] : undefined,
  };
};
