import { css } from '@linaria/core';
import { rgba } from 'polished';

export const globalCss = css`
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

    a.button {
      text-decoration: none;
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
