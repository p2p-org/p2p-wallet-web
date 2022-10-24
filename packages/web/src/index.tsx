import '@abraham/reflection';
import 'sanitize.css';
import './new/ui/css/nprogress.css';
import 'react-loading-skeleton/dist/skeleton.css';

import * as React from 'react';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import { globalCss } from '@p2p-wallet-web/ui';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

import {
  SENTRY_DSN_ENDPOINT,
  SENTRY_ENVIRONMENT,
  SENTRY_RELEASE,
  SENTRY_TRACES_SAMPLE_RATE,
} from 'new/constants';

export const global = globalCss;

if (!__DEVELOPMENT__) {
  Sentry.init({
    dsn: SENTRY_DSN_ENDPOINT,
    integrations: [new BrowserTracing()],
    environment: SENTRY_ENVIRONMENT,
    release: SENTRY_RELEASE,

    tracesSampleRate: Number(SENTRY_TRACES_SAMPLE_RATE),
  });
}

const render = () => {
  // Load the app dynamically, which allows for hot-reloading in development mode.
  const App = require('./App').default as React.FC;

  ReactDOM.render(
    <StrictMode>
      <App />
    </StrictMode>,
    document.querySelector('#root'),
  );
};

render();

// Allow the hot-reloading of the App in development mode
// @TODO Fix typing resolution
if (__DEVELOPMENT__ && module.hot) {
  module.hot.accept('./App', render);
}
