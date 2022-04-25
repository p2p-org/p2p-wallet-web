// @FIXME
// import './wdyr';
import 'sanitize.css';
import '@p2p-wallet-web/ui/css/nprogress.css';
import 'react-loading-skeleton/dist/skeleton.css';

import * as React from 'react';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import { globalCss } from '@p2p-wallet-web/ui';

import { initAmplitude } from 'utils/analytics';

initAmplitude();

export const global = globalCss;

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
