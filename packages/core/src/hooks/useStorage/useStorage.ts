import { useCallback, useEffect, useState } from 'react';

import type { SetStorageValue } from './types';
import { getStorageValue, setStorageValue } from './utils/persistence';

export const useStorage = <T>(
  key: string,
  defaultValue: T,
  ms?: number,
): [T, SetStorageValue<T>] => {
  const [value, _setValue] = useState<T | null>(defaultValue);
  // TODO: can be async in future

  useEffect(() => {
    try {
      const _value = getStorageValue<T>(key);
      _setValue(_value);
    } catch (err) {
      console.error(err);
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

  return [value || defaultValue, setValue];
};
