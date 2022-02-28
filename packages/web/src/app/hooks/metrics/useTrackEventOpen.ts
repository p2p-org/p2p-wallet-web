import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { trackEvent } from 'utils/analytics';
import type { TrackEventType } from 'utils/analytics/types';

// TODO: make somthing with types in TrackEventType
export const useTrackEventOpen: TrackEventType = (event: string, _?: any) => {
  const location = useLocation<{ fromPage?: string }>();

  useEffect(() => {
    trackEvent(event, { Last_Screen: location.state?.fromPage });
  }, []);
};
