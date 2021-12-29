import type { FC } from 'react';

import { styled } from '@linaria/react';

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;

  display: inline-block;
  max-width: 263px;

  cursor: pointer;

  transition: opacity 0.1s ease-in-out, transform 1s ease-in-out, top 1s ease-in-out,
    bottom 1s ease-in-out, right 1s ease-in-out, left 1s ease-in-out;

  &.level-2,
  &.level-1 {
    z-index: 1;
  }

  &.level-2 {
    transform: rotate(20deg);
  }

  &.level-1 {
    transform: rotate(10deg);
  }

  &.level0 {
    top: 0;
    right: 0;
    z-index: 3;

    width: 263px;
    height: 527px;

    transform: rotate(0deg);
  }

  &.level1,
  &.level2 {
    z-index: 1;
  }

  &.level1 {
    top: initial;
    bottom: 0;
    left: 0;

    transform: rotate(-10deg);

    & img {
      width: 208px;
      height: 452px;
    }
  }

  &.level2 {
    transform: rotate(20deg);
  }
`;

interface Props {
  level: number;
  className?: string;
}

export const Item: FC<Props> = ({ level, children, className }) => {
  return <Wrapper className={`${className || ''} level${level}`}>{children}</Wrapper>;
};
