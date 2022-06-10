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

Sentry.init({
  dsn: 'https://088e2b0cd1f44164a6ad584ec3fbab31@o1272413.ingest.sentry.io/6479116',
  integrations: [new BrowserTracing()],
  environment: 'dev',

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
  /*tracesSampler: function () {
    const args = Array.from(arguments);
    console.log('args -', args);
    throw new Error('dont send error to sentry');
  },*/
});

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
