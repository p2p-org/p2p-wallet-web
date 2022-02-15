import { css } from '@linaria/core';
import { rgba } from 'polished';

import { up } from './breakpoints';
import { fonts } from './helpers';
import { dark, light, theme } from './themes';

export const globalCss = css`
  :global() {
    html,
    body,
    #root {
      height: 100%;
    }

    body {
      ${light}
    }

    // body[data-theme='light'] {
    //   ${light}
    // }

    // body[data-theme='dark'] {
    //   ${dark}
    // }

    body {
      font-family: ${fonts.sansSerif};
      line-height: 140%;

      background: ${theme.colors.bg.primary};
      -webkit-font-smoothing: antialiased;

      ${up.tablet} {
        background: ${theme.colors.bg.app};
      }
    }

    a {
      color: ${rgba('#000', 0.5)};
      font-size: 14px;
      text-decoration: underline;
    }

    a.button {
      text-decoration: none;
    }

    button {
      white-space: nowrap;
      user-select: none;

      border: none;
      cursor: pointer;

      appearance: none;
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
