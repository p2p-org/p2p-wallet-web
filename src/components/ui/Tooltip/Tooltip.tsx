import React, { FunctionComponent, useEffect, useRef, useState } from 'react';

import { styled } from '@linaria/react';

const Wrapper = styled.div`
  position: relative;

  display: inline-flex;

  border-bottom: 1px dashed #a3a5ba;
`;

const Title = styled.div`
  display: flex;
  align-items: center;
`;

const Popover = styled.div`
  position: absolute;
  top: 16px;
  right: -14px;
  z-index: 1;

  min-width: max-content;
  margin-top: 8px;
  padding: 10px 12px;

  color: #fff;

  background: rgba(0, 0, 0, 0.75);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
`;

type Props = {
  title: string | React.ReactNode;
  className?: string;
};

export const Tooltip: FunctionComponent<Props> = ({ title, children, className }) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleAwayClick = (e: MouseEvent) => {
    if (!tooltipRef.current?.contains(e.target as HTMLDivElement)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', handleAwayClick);

    return () => {
      window.removeEventListener('click', handleAwayClick);
    };
  }, []);

  const handleTooltipClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Wrapper ref={tooltipRef} className={className}>
      <Title onClick={handleTooltipClick}>{title}</Title>
      {isOpen ? <Popover>{children}</Popover> : undefined}
    </Wrapper>
  );
};
