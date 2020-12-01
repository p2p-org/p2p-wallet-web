/// <reference types="webpack-env" />
import 'sanitize.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { css } from 'linaria';
import { rgba } from 'polished';

import { isDev } from 'config/constants';

import { store } from './store';

export const global = css`
  :global() {
    html,
    body,
    #root {
      height: 100%;
    }

    body {
      font-family: 'Rubik', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;

      background: #f8f8f8;
      -webkit-font-smoothing: antialiased;
    }

    a {
      color: ${rgba('#000', 0.5)};
      font-size: 14px;
      line-height: 140%;
      text-decoration: underline;
    }

    & ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    & ::-webkit-scrollbar-track {
      background: none;
    }

    & ::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 4px;
    }
  }
`;

const render = () => {
  // Load the app dynamically, which allows for hot-reloading in development mode.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-var-requires,global-require
  const App = require('./App').default as React.FC;

  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <App />
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
