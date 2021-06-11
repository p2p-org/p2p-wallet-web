import React, { FC, HTMLAttributes } from 'react';
import { Link } from 'react-router-dom';

import { styled } from '@linaria/react';
import classNames from 'classnames';

export const ButtonLink = styled(Link)`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 226px;
  height: 61px;
  padding: 0 24px;

  color: #000;
  font-weight: 500;
  font-size: 18px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 140%;
  text-decoration: none;

  background-color: #fff;
  border-radius: 32px;
  cursor: pointer;

  transition: background-color 0.1s;

  &:hover {
    background-color: #71e6ff;
  }

  &.green {
    background-color: #bcff4e;

    &:hover {
      background-color: #e3ff74;
    }
  }

  &.glow {
    &::before {
      position: absolute;
      right: 10px;
      bottom: 0;
      left: 10px;

      height: 50px;

      background: linear-gradient(90deg, #fff 0%, #fff 100%);
      border-radius: 32px;
      opacity: 0.3;
      filter: blur(30px);

      content: '';
    }

    &.green {
      &::before {
        background: linear-gradient(90deg, #bcff4e 0%, #bcff4e 100%);
      }
    }
  }
`;

const Text = styled.div`
  &.web,
  &.ios {
    padding-left: 33px;

    background-repeat: no-repeat;
    background-position: 0 50%;
    background-size: 25px;
  }

  &.web {
    background-image: url('./web.png');
  }

  &.ios {
    background-image: url('./ios.png');
  }
`;

type ButtonProps = {
  glow?: boolean;
};

export const ButtonWeb: FC<ButtonProps & HTMLAttributes<HTMLElement>> = ({
  glow,
  className,
  ...props
}) => {
  return (
    <ButtonLink to="/login" className={classNames(className, { glow })} {...props}>
      <Text className="web">Go to web wallet</Text>
    </ButtonLink>
  );
};

export const ButtonIOS: FC<ButtonProps & HTMLAttributes<HTMLElement>> = ({
  glow,
  className,
  ...props
}) => {
  return (
    <ButtonLink to="#" className={classNames(className, { glow, green: true })} {...props}>
      <Text className="ios">Download for iOS</Text>
    </ButtonLink>
  );
};
