import { init, track } from '@amplitude/analytics-browser';
import assert from 'ts-invariant';

import type { AmplitudeActions } from './types';

// init amplitude
assert(
  process.env.REACT_APP_AMPLITUDE_API_KEY,
  "REACT_APP_AMPLITUDE_API_KEY doesn't set in environment",
);
init(process.env.REACT_APP_AMPLITUDE_API_KEY);

// track event
export const trackEvent1 = (action: AmplitudeActions) => {
  track(action.name, (action as { params: Record<string, unknown> }).params);

  console.log(
    `AMPLITUDE sent event:\n- name: '${action.name}'${
      action.params ? `\n- params: '${JSON.stringify(action.params)}'` : ''
    }`,
  );
};
