import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import * as React from 'react';

import { styled } from '@linaria/react';

const Wrapper = styled.div`
  position: relative;
`;

const ButtonWrapper = styled.div`
  cursor: pointer;
`;

const PopoverWrapper = styled.div`
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 1;

  min-width: max-content;
  padding: 20px;

  color: #161616;
  font-weight: 400;
  font-size: 14px;
  font-family: 'Aktiv Grotesk Corp', sans-serif;
  line-height: 18px;

  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
`;

interface Props {
  button: (isShow: boolean) => React.ReactNode;
}

export const Popover: FC<Props> = ({ button, children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isShow, setIsShow] = useState(false);

  const handleAwayClick = (e: MouseEvent) => {
    if (!wrapperRef.current?.contains(e.target as HTMLDivElement)) {
      setIsShow(false);
    }
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleAwayClick);

    return () => {
      window.removeEventListener('mouseup', handleAwayClick);
    };
  }, []);

  const handleToggleShowClick = () => {
    setIsShow(!isShow);
  };

  return (
    <Wrapper ref={wrapperRef}>
      <ButtonWrapper onClick={handleToggleShowClick}>{button(isShow)}</ButtonWrapper>
      {isShow ? <PopoverWrapper>{children}</PopoverWrapper> : null}
    </Wrapper>
  );
};
