import type { FunctionComponent } from 'react';
import { useState } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

const Wrapper = styled.div`
  position: relative;

  display: inline-flex;
`;

const Title = styled.div`
  display: flex;
  align-items: center;

  cursor: pointer;
`;

const Popover = styled.div`
  position: absolute;
  top: 16px;
  right: -14px;
  z-index: 2;

  min-width: max-content;
  margin-top: 8px;
  padding: 10px 12px;

  color: #fff;

  background: rgba(0, 0, 0, 0.75);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);

  &.noOpacity {
    background: #202020;
  }
`;

type Props = {
  title: string | React.ReactNode;
  noOpacity?: boolean;
  className?: string;
};

export const Tooltip: FunctionComponent<Props> = ({ title, noOpacity, children, className }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleMouseEnter = () => {
    setIsOpen(true);
  };
  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <Wrapper className={className}>
      <Title onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {title}
      </Title>
      {isOpen ? <Popover className={classNames({ noOpacity })}>{children}</Popover> : undefined}
    </Wrapper>
  );
};
