import { useCallback, useEffect, useMemo, useReducer } from 'react';

export enum Keys {
  SLIPPAGE_TOLERANCE = 'SLIPPAGE_TOLERANCE',
}

const localStorageListeners: {
  [key: string]: React.DispatchWithoutAction[];
} = {};

export function useLocalStorageString(
  key: string,
  defaultState: string | null = null,
): [string | null, (newState: string | null) => void] {
  const state = localStorage.getItem(key) || defaultState;
  const [, notify] = useReducer((i: number) => i + 1, 0);

  useEffect(() => {
    if (!localStorageListeners[key]) {
      localStorageListeners[key] = [];
    }

    localStorageListeners[key].push(notify);

    return () => {
      localStorageListeners[key] = localStorageListeners[key].filter(
        (listener) => listener !== notify,
      );
    };
  }, [key]);

  const setState = useCallback<(newState: string | null) => void>(
    (newState) => {
      if (state === newState) {
        return;
      } else if (newState === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, newState);
      }

      localStorageListeners[key].forEach((listener) => listener());
    },
    [state, key],
  );

  return [state, setState];
}

export function useLocalStorageBoolean(
  key: string,
  defaultState = true,
): [boolean, (newState: boolean) => void] {
  const [stringState, setStringState] = useLocalStorageString(key, JSON.stringify(defaultState));

  return [
    stringState === 'true' ? true : false,
    (newState) => setStringState(JSON.stringify(newState)),
  ];
}

export function useLocalStorage<T = any>(
  key: string,
  defaultState: T | null = null,
): [T, (newState: T) => void] {
  const [stringState, setStringState] = useLocalStorageString(key, JSON.stringify(defaultState));
  return [
    useMemo(() => stringState && JSON.parse(stringState), [stringState]),
    (newState) => setStringState(JSON.stringify(newState)),
  ];
}
