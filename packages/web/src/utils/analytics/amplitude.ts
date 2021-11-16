import amplitude from 'amplitude-js';
import assert from 'ts-invariant';

import type { TrackEventType } from './types';

export const initAmplitude = () => {
  assert(
    process.env.REACT_APP_AMPLITUDE_API_KEY,
    "REACT_APP_AMPLITUDE_API_KEY doesn't set in environment",
  );
  amplitude.getInstance().init(process.env.REACT_APP_AMPLITUDE_API_KEY);
};

export const trackEvent: TrackEventType = (event: string, data?: any) => {
  amplitude.getInstance().logEvent(event, data);
};
