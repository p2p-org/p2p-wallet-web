import { Identify, identify, init, track } from '@amplitude/analytics-browser';
import assert from 'ts-invariant';

import type { AmplitudeActions, UserProperties } from './types';

// init amplitude
assert(
  process.env.REACT_APP_AMPLITUDE_API_KEY,
  "REACT_APP_AMPLITUDE_API_KEY doesn't set in environment",
);
init(process.env.REACT_APP_AMPLITUDE_API_KEY);

// track Event
export const trackEvent1 = (action: AmplitudeActions) => {
  track(action.name, (action as { params: Record<string, unknown> }).params);

  if (__DEVELOPMENT__) {
    // eslint-disable-next-line no-console
    console.log(
      `AMPLITUDE sent event:
      - name: '${action.name}'
      ${action.params ? `- params: '${JSON.stringify(action.params)}'` : ''}`,
    );
  }
};

// set User Property
export const setUserProperty = (property: UserProperties) => {
  const identifyObj = new Identify();
  identifyObj.set(property.name, property.value);

  identify(identifyObj);

  if (__DEVELOPMENT__) {
    // eslint-disable-next-line no-console
    console.log(`AMPLITUDE set User Property:
    - name: '${property.name}'
    - value: '${property.value}'
    `);
  }
};
