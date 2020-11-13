import 'sanitize.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { css } from 'linaria';
import { rgba } from 'polished';

import { App } from './App';
import { store } from './store';

export const global = css`
  :global(*) {
    body {
      font-family: 'Rubik', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
        'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;

      background: #f8f8f7;
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

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.querySelector('#root'),
);
