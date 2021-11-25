import { useCallback, useEffect, useState } from 'react';

import { getStorageValue, setStorageValue } from './utils/persistence';

export const useStorage = <T>(key: string, defaultValue: T, ms?: number) => {
  const [value, _setValue] = useState<T | null>(defaultValue);

  useEffect(() => {
    try {
      const _value = getStorageValue<T>(key);
      _setValue(_value);
    } catch (err) {
      console.error(err);
    }
  }, [key]);

  const setValue = useCallback(
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

  return [value || defaultValue, setValue];
};
