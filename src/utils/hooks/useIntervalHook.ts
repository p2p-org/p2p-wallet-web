import { useEffect, useRef } from 'react';

// Declarative setInterval with auto-cleanup and mutable delay:
// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
export function useIntervalHook(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
