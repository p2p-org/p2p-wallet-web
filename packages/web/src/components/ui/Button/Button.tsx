import type { FunctionComponent } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';
import { rgba } from 'polished';

const Wrapper = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 0 15px;

  color: #000;
  font-weight: 600;
  font-size: 16px;
  font-family: unset;
  line-height: 140%;
  white-space: nowrap;
  text-decoration: none;

  background: #fff;
  border: 0;
  border-radius: 12px;

  outline: none;
  cursor: pointer;

  appearance: none;

  &.primary {
    color: #fff;

    background: #5887ff;

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
    color: #5887ff;

    background: #fff;
    border: 1px solid #5887ff;
  }

  &.link {
    height: auto;
    padding: 0;

    color: ${rgba('#000', 0.5)};
    text-decoration: underline;

    background: transparent;
  }

  &.small {
    height: 36px;
  }

  &.medium {
    height: 46px;
  }

  &.big {
    height: 58px;
  }

  &.full {
    width: 100%;
  }

  &:disabled {
    color: #fff;

    background: #a3a5ba;

    &:hover {
      background: #a3a5ba;
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
