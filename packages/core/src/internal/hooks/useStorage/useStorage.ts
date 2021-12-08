import { useCallback, useEffect, useState } from 'react';

import type { SetStorageValue } from './types';
import { getStorageValue, setStorageValue } from './utils/persistence';

export const useStorage = <T>(
  key: string,
  defaultValue: T,
  ms?: number,
): [T, boolean, SetStorageValue<T>] => {
  const [value, _setValue] = useState<T | null>(defaultValue);
  // TODO: can be async in future
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const _value = getStorageValue<T>(key);
      _setValue(_value);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  const setValue = useCallback<SetStorageValue<T>>(
    (nextValue: T, customMS?: number) => {
      try {
        setStorageValue(key, nextValue, {
          msTTL: ms || customMS,
        });
        _setValue(nextValue);
      } catch (n) {
        console.error(n);
      }
    },
    [key, ms],
  );

  return [value || defaultValue, isLoading, setValue];
};
