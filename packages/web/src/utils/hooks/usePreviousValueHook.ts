import { useEffect, useRef } from 'react';

// Get the previous value of a prop/state
export function usePreviousValueHook<T>(value: T): T {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
