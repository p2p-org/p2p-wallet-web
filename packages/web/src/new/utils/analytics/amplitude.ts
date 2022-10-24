import { init, track } from '@amplitude/analytics-browser';
import assert from 'ts-invariant';

import type { AmplitudeActions, ComplexActions } from 'new/utils/analytics/types';

// init amplitude
assert(
  process.env.REACT_APP_AMPLITUDE_API_KEY,
  "REACT_APP_AMPLITUDE_API_KEY doesn't set in environment",
);
init(process.env.REACT_APP_AMPLITUDE_API_KEY);

// track event
export const trackEvent1 = (action: AmplitudeActions) => {
  track(action.name, action.params);

  console.log(
    `AMPLITUDE sent event:\n- name: '${action.name}'${
      (action as ComplexActions).params
        ? `\n- params: '${JSON.stringify((action as ComplexActions).params)}'`
        : ''
    }`,
  );
};
