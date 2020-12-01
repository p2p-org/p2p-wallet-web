import React from 'react';

import classNames from 'classnames';
import { styled, StyledComponent } from 'linaria/react';
import { rgba } from 'polished';

const Wrapper = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  padding: 0 20px;

  color: #000;
  font-size: 14px;
  line-height: 140%;
  white-space: nowrap;
  text-decoration: none;

  background: #fff;
  border: 0;
  border-radius: 10px;

  outline: none;
  cursor: pointer;

  appearance: none;

  &.primary {
    color: #fff;

    background: #000;
  }

  &.secondary {
    color: #fff;

    background: #cecece;
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
    height: 40px;
  }

  &.big {
    height: 58px;

    font-weight: 500;
  }

  &.full {
    width: 100%;
  }
`;

type Props = {
  primary?: boolean;
  secondary?: boolean;
  gray?: boolean;
  link?: boolean;
  small?: boolean;
  big?: boolean;
  full?: boolean;
};

export const Button: StyledComponent<Props & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  type = 'button',
  primary,
  secondary,
  gray,
  link,
  small,
  big,
  full,
  children,
  className,
  ...props
}) => {
  return (
    <Wrapper
      type={type}
      {...props}
      className={classNames(className, { primary, secondary, gray, link, small, full, big })}>
      {children}
    </Wrapper>
  );
};
