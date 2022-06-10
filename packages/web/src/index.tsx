import 'sanitize.css';
import './css/nprogress.css';
import 'react-loading-skeleton/dist/skeleton.css';

import * as React from 'react';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import { globalCss } from '@p2p-wallet-web/ui';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

import { initAmplitude } from 'utils/analytics';

initAmplitude();

export const global = globalCss;

const SENTRY_DSN_ENDPOINT = process.env.REACT_APP_SENTRY_DSN_ENDPOINT;
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT;
const SENTRY_TRACES_SAMPLE_RATE = process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE;
const SENTRY_RELEASE = process.env.REACT_APP_SENTRY_RELEASE;

if (__DEVELOPMENT__) {
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
