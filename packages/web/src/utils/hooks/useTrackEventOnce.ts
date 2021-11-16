import { useCallback, useRef } from 'react';

import amplitude from 'amplitude-js';

import type { TrackEventType } from 'utils/analytics/types';

export function useTrackEventOnce() {
  const tracked = useRef<string[]>([]);

  const trackEventOnce = useCallback<TrackEventType>((event: string, data?: any) => {
    if (tracked.current.includes(event)) {
      return;
    }

    amplitude.getInstance().logEvent(event, data);
    tracked.current = [...tracked.current, event];
  }, []);

  return trackEventOnce;
}
