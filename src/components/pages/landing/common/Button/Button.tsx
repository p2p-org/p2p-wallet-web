import React, { FC, HTMLAttributes } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

export const Button = styled.a`
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 226px;
  height: 61px;
  padding: 0 24px;

  text-decoration: none;

  background: #fff;
  border-radius: 32px;

  &.green {
    background-image: linear-gradient(90deg, #bcff4e 0%, #bcff4e 100%);
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
  color: #000;
  font-weight: 500;
  font-size: 18px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 140%;

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

export const ButtonWeb: FC<ButtonProps & HTMLAttributes<HTMLElement>> = ({ glow, className }) => {
  return (
    <Button className={classNames(className, { glow })}>
      <Text className="web">Go to web wallet</Text>
    </Button>
  );
};

export const ButtonIOS: FC<ButtonProps & HTMLAttributes<HTMLElement>> = ({ glow, className }) => {
  return (
    <Button className={classNames(className, { glow, green: true })}>
      <Text className="ios">Download for iOS</Text>
    </Button>
  );
};
