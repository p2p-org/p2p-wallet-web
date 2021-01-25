import React, { FunctionComponent } from 'react';

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
  }

  &.secondary {
    color: #fff;

    background: #cecece;
  }

  &.light {
    color: #5887ff;

    background: #eff3ff;
  }

  &.gray {
    color: #000;

    background: #f3f3f3;
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

  &.big {
    height: 58px;
  }

  &.full {
    width: 100%;
  }

  &:disabled {
    color: #fff;

    background: #7b7b7b;
  }
`;

type Props = {
  primary?: boolean;
  secondary?: boolean;
  light?: boolean;
  gray?: boolean;
  link?: boolean;
  small?: boolean;
  big?: boolean;
  full?: boolean;
};

export const Button: FunctionComponent<Props & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  type = 'button',
  primary,
  secondary,
  light,
  gray,
  link,
  small,
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
        gray,
        link,
        small,
        full,
        big,
      })}>
      {children}
    </Wrapper>
  );
};
