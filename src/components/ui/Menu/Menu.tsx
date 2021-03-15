import React, { FunctionComponent, useEffect, useRef, useState } from 'react';

import { styled } from '@linaria/react';
import classNames from 'classnames';

import { Icon } from 'components/ui';

const Wrapper = styled.div`
  position: relative;
`;

const MoreIcon = styled(Icon)`
  width: 24px;
  height: 24px;

  color: #a3a5ba;
`;

const MoreIconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 36px;
  height: 36px;

  cursor: pointer;

  &.isOpen,
  &:hover {
    ${MoreIcon} {
      color: #5887ff;
    }
  }

  &.vertical {
    transform: rotate(90deg);
  }
`;

const DropDownList = styled.div`
  position: absolute;
  left: 0;
  z-index: 1;

  min-width: 150px;
  margin-top: 4px;
  padding: 10px;

  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
`;

type Props = {
  vertical?: boolean;
};

export const Menu: FunctionComponent<Props> = ({ children, vertical }) => {
  const selectorRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleAwayClick = (e: MouseEvent) => {
    if (!selectorRef.current?.contains(e.target as HTMLDivElement)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    window.addEventListener('click', handleAwayClick);

    return () => {
      window.removeEventListener('click', handleAwayClick);
    };
  }, []);

  const handleMenuClick = () => {
    setIsOpen(!isOpen);
  };

  const items = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { close: handleMenuClick });
    }
    return child;
  });

  return (
    <Wrapper ref={selectorRef}>
      <MoreIconWrapper onClick={handleMenuClick} className={classNames({ isOpen, vertical })}>
        <MoreIcon name="more" />
      </MoreIconWrapper>
      {isOpen ? <DropDownList>{items}</DropDownList> : undefined}
    </Wrapper>
  );
};
