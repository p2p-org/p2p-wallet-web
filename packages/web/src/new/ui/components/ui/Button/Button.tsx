import type { FunctionComponent } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import { theme } from '@p2p-wallet-web/ui';
import classNames from 'classnames';
import { rgba } from 'polished';

const Wrapper = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  padding: 0 15px;

  color: ${theme.colors.textIcon.primary};
  font-weight: bold;
  font-size: 16px;
  font-family: unset;
  line-height: 140%;
  letter-spacing: 0.04em;
  white-space: initial;
  text-decoration: none;

  background: ${theme.colors.bg.primary};
  border: 0;
  border-radius: 12px;

  outline: none;
  cursor: pointer;

  appearance: none;

  &.primary {
    color: ${theme.colors.textIcon.buttonPrimary};

    background: ${theme.colors.bg.buttonPrimary};

    &:hover {
      background: #82a5ff;
    }
  }

  &.secondary {
    color: #fff;

    background: #a3a5ba;
  }

  &.dark {
    color: #fff;

    background: #000;
  }

  &.light {
    color: #5887ff;

    background: #eff3ff;
  }

  &.gray {
    color: #000;

    background: #f3f3f3;
  }

  &.lightGray {
    color: #a3a5ba;

    background: #f6f6f8;
  }

  &.lightBlue {
    color: #5887ff;

    background: #f6f6f8;
  }

  &.hollow {
    background: ${theme.colors.bg.primary};
    border: 1px solid ${theme.colors.stroke.primary};
  }

  &.link {
    height: auto;
    padding: 0;

    color: ${rgba('#000', 0.5)};
    text-decoration: underline;

    background: transparent;
  }

  &.error {
    color: ${theme.colors.system.errorMain};

    &:hover {
      color: ${theme.colors.system.errorMain};
    }
  }

  &.small {
    height: 36px;

    font-weight: 500;
    font-size: 14px;
    letter-spacing: 0.01em;

    border-radius: 8px;
  }

  &.medium {
    height: 46px;

    font-weight: 500;
    letter-spacing: 0.01em;

    border-radius: 8px;
  }

  &.big {
    height: 58px;
  }

  &.full {
    width: 100%;
  }

  &:disabled {
    color: ${theme.colors.textIcon.buttonPrimary};

    background: ${theme.colors.bg.buttonDisabled};
    cursor: not-allowed;

    &:hover {
      background: ${theme.colors.bg.buttonDisabled};
    }
  }
`;

type Props = {
  primary?: boolean;
  secondary?: boolean;
  dark?: boolean;
  light?: boolean;
  gray?: boolean;
  lightGray?: boolean;
  lightBlue?: boolean;
  hollow?: boolean;
  link?: boolean;
  error?: boolean;
  small?: boolean;
  medium?: boolean;
  big?: boolean;
  full?: boolean;
};

export const Button: FunctionComponent<Props & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  type = 'button',
  primary,
  secondary,
  dark,
  light,
  gray,
  lightGray,
  lightBlue,
  link,
  error,
  hollow,
  small,
  medium,
  big,
  full,
  children,
  style,
  className,
  ...props
}) => {
  return (
    <Wrapper
      type={type}
      {...props}
      style={style}
      className={classNames(className, {
        primary,
        secondary,
        light,
        dark,
        gray,
        lightGray,
        lightBlue,
        link,
        error,
        hollow,
        small,
        medium,
        big,
        full,
      })}
    >
      {children}
    </Wrapper>
  );
};
