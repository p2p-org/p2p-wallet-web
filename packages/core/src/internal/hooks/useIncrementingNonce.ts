import { useCallback, useEffect, useState } from 'react';

export const useIncrementingNonce = (ms?: number) => {
  const [increment, _setIncrement] = useState(0);

  const setIncrement = useCallback(() => _setIncrement((state) => state + 1), []);

  useEffect(() => {
    if (ms) {
      const timer = setInterval(setIncrement, ms);
      return () => clearInterval(timer);
    }
  }, [ms]);

  return [increment, setIncrement];
};
