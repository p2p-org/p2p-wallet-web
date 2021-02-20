import 'sanitize.css';
import 'styles/css/nprogress.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { FeatureProvider } from 'components/common/FeatureProvider';
import { isDev } from 'config/constants';
import { store } from 'store';
import { globalCss } from 'styles/global';

export const global = globalCss;

const render = () => {
  // Load the app dynamically, which allows for hot-reloading in development mode.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-var-requires,global-require
  const App = require('./App').default as React.FC;

  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <FeatureProvider>
          <App />
        </FeatureProvider>
      </Provider>
    </React.StrictMode>,
    document.querySelector('#root'),
  );
};

render();

// Allow the hot-reloading of the App in development mode
if (isDev && module.hot) {
  module.hot.accept('./App', render);
}
