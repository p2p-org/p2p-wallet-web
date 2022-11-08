import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { trackEvent } from '../amplitude';
import type { OpenPageActionNames } from '../types';

export const useTrackOpenPageAction = (eventName: OpenPageActionNames) => {
  const location = useLocation<{ fromPage?: string }>();

  useEffect(() => {
    let lastScreen = null;
    if (location.state.fromPage && location.state.fromPage !== location.pathname) {
      lastScreen = location.state.fromPage;
    }

    trackEvent({
      name: eventName,
      params: { Last_Screen: lastScreen },
    });
  }, []);
};
