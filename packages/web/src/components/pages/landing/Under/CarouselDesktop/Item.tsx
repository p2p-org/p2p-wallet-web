import type { FC } from 'react';

import { styled } from '@linaria/react';

const Wrapper = styled.div`
  position: absolute;

  display: inline-block;
  max-width: 1136px;
  margin: 0 30px;

  transform: translateY(0) scale(0.82);

  cursor: pointer;

  transition: opacity 0.3s, transform 0.5s;

  &.level-2,
  &.level-1 {
    z-index: 1;

    opacity: 0.75;
  }

  &.level-2 {
    transform: translateY(0) scale(0.92);
  }

  &.level-1 {
    transform: translateY(0) scale(0.92);

    &:hover {
      transform: translateY(0) scale(0.94);
      opacity: 0.9;
    }
  }

  &.level0 {
    position: relative;
    z-index: 3;

    transform: translateY(0) scale(1);
    opacity: 1;
  }

  &.level1,
  &.level2 {
    z-index: 1;

    opacity: 0.75;
  }

  &.level1 {
    transform: translateY(35px) scale(0.95);

    &:hover {
      transform: translateY(35px) scale(0.97);
      opacity: 0.9;
    }
  }

  &.level2 {
    transform: translateY(0) scale(0.92);
  }
`;

interface Props {
  level: number;
  className?: string;
}

export const Item: FC<Props> = ({ level, children, className }) => {
  return <Wrapper className={`${className || ''} level${level}`}>{children}</Wrapper>;
};
