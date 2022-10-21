import { init, track } from '@amplitude/analytics-browser';
import assert from 'ts-invariant';

import type { AmplitudeActions } from 'new/services/AnalyticsService/types';

export const initAmplitude = () => {
  assert(
    process.env.REACT_APP_AMPLITUDE_API_KEY,
    "REACT_APP_AMPLITUDE_API_KEY doesn't set in environment",
  );
  init(process.env.REACT_APP_AMPLITUDE_API_KEY);
};

export const trackEvent1 = (action: AmplitudeActions) => {
  track(action.name, action.params);
};
