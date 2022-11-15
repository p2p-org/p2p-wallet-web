import { useEffect } from 'react';
import { useLocation } from 'react-router';

import { trackEvent } from '../amplitude';
import type { OpenPageActionNames } from '../types';

export const useTrackOpenPageAction = (eventName: OpenPageActionNames) => {
  const location = useLocation<{ redirectTo?: string }>();

  useEffect(() => {
    let lastScreen = null;
    if (location.state?.redirectTo && location.state?.redirectTo !== location.pathname) {
      lastScreen = location.state?.redirectTo;
    }

    trackEvent({
      name: eventName,
      params: { Last_Screen: lastScreen },
    });
  }, []);
};
